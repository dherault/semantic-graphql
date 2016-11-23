const path = require('path');
const { readFileSync } = require('fs');
const createRdfParser = require('n3').Parser;
const { GraphQLObjectType, GraphQLScalarType } = require('graphql');
const { rdfIri, rdfsIri, xsdIri } = require('./namespaces');
const getLocalName = require('./utils/getIriLocalName');
const { graphqlScalarTypes, graphqlScalarMethods } = require('./scalars');
const validateResolvers = require('./validation/validateResolvers');
const invariant = require('./utils/invariant');
const polymorphicTypesMap = require('./polymorphicTypesMap');

function parseRdf(data, options) {
  const parser = createRdfParser(options);

  parser._prefixCallback = () => null; // See n3#78

  return parser.parse(data);
}

function upsert(theGuy, whoDid, what, kevinOffACliff) {
  const theGuyWhoDid = theGuy[whoDid];

  /*do you know*/theGuyWhoDid ?
  theGuyWhoDid[what] ?
  theGuyWhoDid[what].push(kevinOffACliff) :
  theGuyWhoDid[what] = [kevinOffACliff] : // ?!!??!
  theGuy[whoDid] = { [what]: [kevinOffACliff] };
}

const isValidIri = s => typeof s === 'string' && s.startsWith('http');

function indexTriple(g, { subject, predicate, object }) {
  if (!(isValidIri(subject) && isValidIri(predicate))) return;

  if (g[subject] && g[subject][predicate] && g[subject][predicate].includes(object)) return;

  upsert(g, subject, predicate, object);
  if (isValidIri(object)) upsert(g, object, `_${predicate}`, subject); // for now
  // upsert(g, predicate, `__${subject}`, object);
  // upsert(g, predicate, `___${object}`, subject);
}

const g = {};
const utf8 = 'utf-8';
const parseFileAndIndex = (g, l, e = utf8) => parseRdf(readFileSync(path.join(__dirname, l), e)).forEach(t => indexTriple(g, t));

parseFileAndIndex(g, '../ontologies/rdfs.ttl');
parseFileAndIndex(g, '../ontologies/rdf.ttl');
parseFileAndIndex(g, '../ontologies/owl.ttl');
parseFileAndIndex(g, '../ontologies/skos.ttl');

const rdfsClass = `${rdfsIri}Class`;
const rdfsComment = `${rdfsIri}comment`;
const rdfsLabel = `${rdfsIri}label`;
const rdfsRange = `${rdfsIri}range`;
const rdfsResource = `${rdfsIri}Resource`;
const rdfsSubClassOf = `${rdfsIri}subClassOf`;
const _rdfsDomain = `_${rdfsIri}domain`;
const _rdfsSubClassOf = `_${rdfsSubClassOf}`;
const _rdfsSubPropertyOf = `_${rdfsIri}subPropertyOf`;
const _rdfType = `_${rdfIri}type`;

const isXsdLiteral = iri => iri.startsWith(xsdIri);

function walkmap(g, o, p, s = new Set()) {
  if (s.has(o)) return s;

  s.add(o);

  if (g[o][p]) g[o][p].forEach(_o => walkmap(g, _o, p, s));

  return s;
}

class Graph {

  constructor(resolvers) {
    invariant(resolvers && typeof resolvers === 'object', 'Expected first arg to be an object');
    validateResolvers(resolvers);

    Object.assign(this, g, { resolvers });

    this.addTriple = t => indexTriple(this, t);
    this.parse = (d, o) => parseRdf(d, o).forEach(this.addTriple);
    this.parseFile = (l, e = utf8) => this.parse(readFileSync(l, e));
  }

  getObjectType(iri) {
    if (this[iri].objectType) return this[iri].objectType;

    console.log('_getObjectType', iri);

    return this[iri].objectType = new GraphQLObjectType({
      name: this.getGraphqlName(iri),
      description: this.getGraphqlDescription(iri),
      fields: () => this.getGraphqlFieldConfigMap(iri),
      // interfaces: () => [...this.getInterfacesSet(collection)],
    });
  }

  // TODO: reecrire en fonctionnel hors class
  getGraphqlName(iri) {
    return this[iri].graphqlName || (this[iri].graphqlName = getLocalName(iri).replace(/\W/g, '_')); // GraphQL-safe name
  }

  getGraphqlDescription(iri) {
    if (this[iri].graphqlDescription) return this[iri].graphqlDescription;

    const label = this[iri][rdfsLabel] && this[iri][rdfsLabel][0] || '';
    const comment = this[iri][rdfsComment] && this[iri][rdfsComment][0];

    return this[iri].graphqlDescription = `${label}${label && comment ? ' - ' : ''}${comment || ''}`;
  }

  getGraphqlFieldConfigMap(iri) {
    const properties = new Set();

    // Find superClasses of the class and their superClasses
    walkmap(this, iri, rdfsSubClassOf)
    // Many universal properties, like label and comment, have rdfs:Resource in their domain
    .add(rdfsResource)
    // For each superClass, find properties on their domain
    .forEach(superClass => this[superClass][_rdfsDomain] &&
      // For each property, add the property to the list and find its subProperties and their subProperties
      this[superClass][_rdfsDomain].forEach(property => walkmap(this, property, _rdfsSubPropertyOf, properties)));

    const fieldConfigMap = {};

    properties.forEach(property => {
      const localName = getLocalName(property);

      if (fieldConfigMap[localName]) return console.log(`Duplicate localName with ${property} on fieldConfigMap of ${iri}`);

      const fieldConfig = this.getGraphqlFieldConfig(property);

      if (fieldConfig) fieldConfigMap[localName] = this.getGraphqlFieldConfig(property);
    });

    return fieldConfigMap;
  }

  getGraphqlFieldConfig(iri) {
    if (this[iri].graphqlFieldConfig) return this[iri].graphqlFieldConfig;

    console.log('getGraphqlFieldConfig', iri);

    const ranges = this[iri][rdfsRange];

    if (!ranges) return; // TODO: subPropertyOf
    if (!ranges.length) return;

    const fieldConfig = {};

    if (ranges.every(isXsdLiteral)) {
      fieldConfig.type = this.getGraphqlFieldScalarType(ranges);
      fieldConfig.resolve = this.getGraphqlScalarResolver(iri);
    }
    else if (ranges.some(isXsdLiteral)) throw new Error(`Cannot do everything: ${ranges}`);
    else {
      fieldConfig.type = this.getGraphqlFieldObjectType(ranges);
      fieldConfig.resolve = this.getGraphqlObjectResolver(iri);
    }

    return this[iri].graphqlFieldConfig = fieldConfig;
  }

  getGraphqlFieldScalarType(ranges) {
    if (ranges.length === 1) {
      const range = ranges[0];
      const type = graphqlScalarTypes[getLocalName(range)];

      if (!type) throw new Error(`getGraphqlScalarType ${range})`);

      return type;
    }
    // Polymorphic range: already created
    else if (polymorphicTypesMap.has(ranges)) {
      return polymorphicTypesMap.get(ranges);
    }
    // Polymorphic range: not cached, so we create it
    // NOTE: The current implementation uses the ordered ranges to pick the prefered type when
    // multiple types are available. (typically float and integer, string and id, etc...)
    const localNames = ranges.map(range => getLocalName(range));
    const scalarTypes = localNames.map(localName => graphqlScalarTypes[localName]);

    if (scalarTypes.some(type => !type)) throw new Error(`Validate much? ranges: ${ranges}`);

    const scalarMethods = scalarTypes.map(type => graphqlScalarMethods.get(type));

    // No exception thrown here, GraphQL takes care of it
    const coerce = value => {
      const correctMethods = scalarMethods.filter(({ isOfType }) => isOfType(value));

      if (!correctMethods.length) return null;

      return correctMethods[0].coerce(value); // Favors precedence in graphqlScalarMethods
    };

    const type = new GraphQLScalarType({
      name: `Polymorphic_scalar_${localNames.join('_')}`,
      serialize: coerce,
      parseValue: coerce,
      parseLiteral: ast => scalarMethods
        .map(({ parseLiteral }) => parseLiteral(ast))
        .filter(value => value !== null)[0] || null,
    });

    polymorphicTypesMap.set(ranges, type);

    return type;
  }

  getGraphqlFieldObjectType(ranges) {
    if (ranges.length === 1) {
      return this.getObjectType(ranges[0]);
    }

    throw new Error(`Polymorphism is coming ${ranges}`);
  }

  getGraphqlScalarResolver(iri) {
    return source => this.resolvers.resolveFieldValue(source, iri, getLocalName(iri));
  }

  getGraphqlObjectResolver(iri) {
    const isList = this.isGraphqlList(iri);

    const resolveRef = isList ? this.resolvers.resolveIds : this.resolvers.resolveId;

    return source => {
      const ref = this.resolvers.resolveFieldValue(source, iri, getLocalName(iri));

      if (typeof ref !== 'undefined') {
        if (isList) return resolveRef(Array.isArray(ref) ? ref : [ref]);

        return resolveRef(Array.isArray(ref) ? ref[0] : ref);
      }

      return null;
      // TODO: inverseOf
    };
  }

  isGraphqlList(iri) {
    if (typeof this[iri].isGraphqlList !== 'undefined') return this[iri].isGraphqlList;

    return this[iri].isGraphqlList = true; // !
  }

  listClasses() {
    const classes = new Set();

    walkmap(this, rdfsClass, _rdfsSubClassOf)
    .forEach(classLike => this[classLike][_rdfType] && this[classLike][_rdfType].forEach(classes.add, classes));

    return classes;
  }
}

module.exports = Graph;

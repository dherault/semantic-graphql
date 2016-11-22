const path = require('path');
const { readFileSync } = require('fs');
const createRdfParser = require('n3').Parser;
const { GraphQLObjectType } = require('graphql');
const { rdfIri, rdfsIri } = require('./namespaces');
const getLocalName = require('./utils/getIriLocalName');

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

function index(g, { subject, predicate, object }) {
  if (!(isValidIri(subject) && isValidIri(predicate))) return;

  if (g[subject] && g[subject][predicate] && g[subject][predicate][object]) return;

  upsert(g, subject, predicate, object);
  if (isValidIri(object)) upsert(g, object, `_${predicate}`, subject); // for now
  upsert(g, predicate, `__${subject}`, object);
  upsert(g, predicate, `___${object}`, subject);
}


const g = {};
const utf8 = 'utf-8';
const parseFileAndIndex = (g, l, e = utf8) => parseRdf(readFileSync(path.join(__dirname, l), e)).forEach(t => index(g, t));

parseFileAndIndex(g, '../ontologies/rdfs.ttl');
parseFileAndIndex(g, '../ontologies/rdf.ttl');
parseFileAndIndex(g, '../ontologies/owl.ttl');
parseFileAndIndex(g, '../ontologies/skos.ttl');

const rdfsLabel = `${rdfsIri}label`;
const rdfsComment = `${rdfsIri}comment`;
const rdfsClass = `${rdfsIri}Class`;
const _rdfsSubClassOf = `_${rdfsIri}subClassOf`;
const _rdfType = `_${rdfIri}type`;

function walkmap(g, o, p, s = new Set()) {
  if (s.has(o)) return s;

  s.add(o);

  if (g[o][p]) g[o][p].forEach(_o => walkmap(g, _o, p, s));

  return s;
}

class Graph {

  constructor() {
    Object.assign(this, g);

    this.addTriple = t => index(this, t);
    this.parse = (d, o) => parseRdf(d, o).forEach(this.addTriple);
    this.parseFile = (l, e = utf8) => this.parse(readFileSync(l, e));
  }

  getObjectType(iri) {
    if (this[iri].objectType) return this[iri].objectType;

    return this[iri].objectType = new GraphQLObjectType({
      name: this.getGraphqlName(iri),
      description: this.getGraphqlDescription(iri),
      // fields: () => this.getGraphqlFieldConfigMap(collection),
      // interfaces: () => [...this.getInterfacesSet(collection)],
    });
  }

  getGraphqlName(iri) {
    return this[iri].graphqlName || (this[iri].graphqlName = getLocalName(iri).replace(/\W/g, '_')); // GraphQL-safe name
  }

  getGraphqlDescription(iri) {
    if (this[iri].graphqlDescription) return this[iri].graphqlDescription;

    const label = this[iri][rdfsLabel] && this[iri][rdfsLabel][0] || '';
    const comment = this[iri][rdfsComment] && this[iri][rdfsComment][0];

    return this[iri].graphqlDescription = `${label}${label && comment ? ' - ' : ''}${comment || ''}`;
  }

  listClasses() {
    const classes = new Set();

    walkmap(this, rdfsClass, _rdfsSubClassOf)
    .forEach(classLike => g[classLike][_rdfType] && g[classLike][_rdfType].forEach(classes.add, classes));

    return classes;
  }
}

module.exports = Graph;

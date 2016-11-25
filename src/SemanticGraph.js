const path = require('path');
const { readFileSync } = require('fs');
const createRdfParser = require('n3').Parser;
const invariant = require('./utils/invariant');
const isValidIri = require('./utils/isValidIri');
const getIriLocalName = require('./utils/getIriLocalName');
const validateResolvers = require('./validateResolvers');
const getGraphqlObjectType = require('./graphql/getGraphqlObjectType');
const getGraphqlInterfaceType = require('./graphql/getGraphqlInterfaceType');

const baseGraph = {};
const utf8 = 'utf-8';
const ttlParser = createRdfParser();
const parseFileAndIndex = (g, l) => ttlParser.parse(readFileSync(path.join(__dirname, l), utf8)).forEach(t => indexTriple(g, t));

parseFileAndIndex(baseGraph, '../ontologies/rdf.ttl');
parseFileAndIndex(baseGraph, '../ontologies/rdfs.ttl');

class SemanticGraph {

  constructor(resolvers, config = {}) {
    invariant(resolvers && typeof resolvers === 'object', 'Expected first arg to be an object');
    invariant(config && typeof config === 'object', 'Expected second arg to be an object');

    validateResolvers(resolvers);

    Object.assign(this, baseGraph, { resolvers, config });

    if (config.owl) parseFileAndIndex(this, '../ontologies/owl.ttl');
    if (config.skos) parseFileAndIndex(this, '../ontologies/skos.ttl');

    this.addTriple = t => indexTriple(this, t);
    this.parse = (d, o) => createRdfParser(o).parse(d).forEach(this.addTriple);
    this.parseFile = (l, e = utf8) => this.parse(readFileSync(l, e));
    this.getLocalName = iri => this[iri].localName ? this[iri].localName : this[iri].localName = getIriLocalName(iri);
    this.getObjectType = iri => getGraphqlObjectType(this, iri);
    this.getInterfaceType = iri => getGraphqlInterfaceType(this, iri);
    this.toString = () => '[SemanticGraph]';
  }
}

function indexTriple(g, { subject, predicate, object }) {
  if (!(isValidIri(subject) && isValidIri(predicate)) || g[subject] && g[subject][predicate] && g[subject][predicate].includes(object)) return;

  upsert(g, subject, predicate, object);

  if (isValidIri(object)) upsert(g, object, `_${predicate}`, subject);
}

function upsert(theGuy, whoDid, what, kevinOffACliff) {
  const theGuyWhoDid = theGuy[whoDid];

  /*do you know*/theGuyWhoDid ?
  theGuyWhoDid[what] ?
  theGuyWhoDid[what].push(kevinOffACliff) :
  theGuyWhoDid[what] = [kevinOffACliff] : // ?!!??!
  theGuy[whoDid] = { [what]: [kevinOffACliff] };
}

module.exports = SemanticGraph;

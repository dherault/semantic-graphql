const fs = require('fs');
const path = require('path');
const createRdfParser = require('n3').Parser;

function parseRdf(data, options) {
  const parser = createRdfParser(options);

  parser._prefixCallback = () => null; // See n3#78

  return parser.parse(data);
}

const utf8 = 'utf-8';
const rdfsTriples = parseRdf(fs.readFileSync(path.join(__dirname, '../ontologies/rdfs.ttl'), utf8));
const rdfTriples = parseRdf(fs.readFileSync(path.join(__dirname, '../ontologies/rdf.ttl'), utf8));
const owlTriples = parseRdf(fs.readFileSync(path.join(__dirname, '../ontologies/owl.ttl'), utf8));
// const skosTriples = parseRdf(fs.readFileSync(path.join(__dirname, '../ontologies/skos.ttl'), utf8));

class Graph {

  constructor() {
    this.triples = [...rdfTriples, ...rdfsTriples, ...owlTriples];
  }

  parse(data) {
    const graphId = Math.random().toString();
    this.triples.push(...parseRdf(data).map(x => Object.assign(x, { graph: graphId })));
  }

  parseFile(location, encoding = utf8) {
    this.parse(fs.readFileSync(location, encoding));
  }

  // getObjects(subject, predicate) {
  //   return this.triples
  //   .filter(t => t.subject === subject && t.predicate === predicate)
  //   .map(t => t.object);
  // }
}

module.exports = Graph;

const path = require('path');
const { readFileSync } = require('fs');
const createRdfParser = require('n3').Parser;
const invariant = () => null;

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
  invariant(isValidIri(subject) && isValidIri(predicate));

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

class Graph {

  constructor() {
    Object.assign(this, g);

    this.addTriple = t => index(this, t);
    this.parse = (d, o) => parseRdf(d, o).forEach(this.addTriple);
    this.parseFile = (l, e = utf8) => this.parse(readFileSync(l, e));
  }
}

module.exports = Graph;

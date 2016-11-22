const path = require('path');
const Graph = require('../..');

const _ = new Graph();

const rdfIri = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
const rdfsIri = 'http://www.w3.org/2000/01/rdf-schema#';
// const xsdIri = 'http://www.w3.org/2001/XMLSchema#';
// const owlIri = 'http://www.w3.org/2002/07/owl#';

const rdfTypeIri = `${rdfIri}type`;
const rdfsClassIri = `${rdfsIri}Class`;
const rdfsSubClassOf = `${rdfsIri}subClassOf`;

console.log(_.triples.length);

_.parseFile(path.join(__dirname, './ontology.ttl'));

console.log(_.triples.length);

const subClassOfrdfsClass = _.triples
  .filter(t => t.predicate === rdfsSubClassOf && t.object === rdfsClassIri)
  .map(t => t.subject);

// Will be recursive, walking the graph
const classIris = [rdfsClassIri, ...subClassOfrdfsClass];

console.log(_.triples.filter(t => t.predicate === rdfTypeIri && classIris.includes(t.object) && t.graph));

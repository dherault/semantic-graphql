const path = require('path');
const Graph = require('../..');

// const rdfIri = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#';
// const rdfsIri = 'http://www.w3.org/2000/01/rdf-schema#';
// const xsdIri = 'http://www.w3.org/2001/XMLSchema#';
// const owlIri = 'http://www.w3.org/2002/07/owl#';

// const rdfTypeIri = `${rdfIri}type`;
// const rdfsClassIri = `${rdfsIri}Class`;
// const rdfsSubClassOf = `${rdfsIri}subClassOf`;

const _ = new Graph();

_.parseFile(path.join(__dirname, './ontology.ttl'));

// console.log(_.listClasses());

console.log(_.getObjectType('http://foo.com#Person').description);

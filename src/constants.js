const x = {
  rdfIri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfsIri: 'http://www.w3.org/2000/01/rdf-schema#',
  xsdIri: 'http://www.w3.org/2001/XMLSchema#',
  owlIri: 'http://www.w3.org/2002/07/owl#',
};

x.rdfType = `${x.rdfIri}type`;
x.rdfsClass = `${x.rdfsIri}Class`;
x.rdfsLabel = `${x.rdfsIri}label`;
x.rdfsLiteral = `${x.rdfsIri}Literal`;
x.rdfsResource = `${x.rdfsIri}Resource`;
x.rdfsComment = `${x.rdfsIri}comment`;
x.rdfsRange = `${x.rdfsIri}range`;
x.rdfsSubClassOf = `${x.rdfsIri}subClassOf`;
x.rdfsSubPropertyOf = `${x.rdfsIri}subPropertyOf`;
x.owlFunctionalProperty = `${x.owlIri}FunctionalProperty`;

x._rdfType = `_${x.rdfType}`;
x._rdfsDomain = `_${x.rdfsIri}domain`;
x._rdfsSubClassOf = `_${x.rdfsSubClassOf}`;
x._rdfsSubPropertyOf = `_${x.rdfsSubPropertyOf}`;

module.exports = x;

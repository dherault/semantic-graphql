const x = {
  rdfIri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  rdfsIri: 'http://www.w3.org/2000/01/rdf-schema#',
  xsdIri: 'http://www.w3.org/2001/XMLSchema#',
  owlIri: 'http://www.w3.org/2002/07/owl#',
};

x.rdfType = `${x.rdfIri}type`;
x.rdfsClass = `${x.rdfsIri}Class`;
x.rdfsLiteral = `${x.rdfsIri}Literal`;
x.rdfsResource = `${x.rdfsIri}Resource`;
x.rdfsLabel = `${x.rdfsIri}label`;
x.rdfsComment = `${x.rdfsIri}comment`;
x.rdfsDomain = `${x.rdfsIri}domain`;
x.rdfsRange = `${x.rdfsIri}range`;
x.rdfsSubClassOf = `${x.rdfsIri}subClassOf`;
x.rdfsSubPropertyOf = `${x.rdfsIri}subPropertyOf`;
x.owlFunctionalProperty = `${x.owlIri}FunctionalProperty`;
x.owlInverseOf = `${x.owlIri}inverseOf`;

x._rdfType = `_${x.rdfType}`;
x._rdfsDomain = `_${x.rdfsDomain}`;
x._rdfsSubClassOf = `_${x.rdfsSubClassOf}`;
x._rdfsSubPropertyOf = `_${x.rdfsSubPropertyOf}`;
x._owlInverseOf = `_${x.owlInverseOf}`;

module.exports = x;

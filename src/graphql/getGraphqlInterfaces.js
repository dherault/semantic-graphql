const { rdfsSubClassOf, rdfsResource } = require('../constants');
const { walkmap } = require('../walkGraph');
const getGraphqlInterfaceType = require('./getGraphqlInterfaceType');

function getGraphqlInterfaces(g, iri) {
  const interfaces = [];

  // Find superClasses of the class and their superClasses
  walkmap(g, iri, rdfsSubClassOf)
  // Many universal properties, like label and comment, have rdfs:Resource in their domain
  .add(rdfsResource)
  .forEach(classIri => interfaces.push(getGraphqlInterfaceType(g, classIri)));

  if (g.config.relay) interfaces.push(g.nodeInterface);

  return interfaces;
}

module.exports = getGraphqlInterfaces;

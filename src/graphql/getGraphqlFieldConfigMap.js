const { GraphQLID } = require('graphql');
const { rdfsSubClassOf, rdfsResource, _rdfsDomain, _rdfsSubPropertyOf } = require('../constants');
const memorize = require('../memorize');
const { walkmap } = require('../walkGraph');
const requireGraphqlRelay = require('../requireGraphqlRelay');
const getGraphqlFieldConfig = require('./getGraphqlFieldConfig');
const getGraphqlName = require('./getGraphqlName');

function getGraphqlFieldConfigMap(g, iri) {
  const properties = new Set();

  // Find superClasses of the class and their superClasses
  walkmap(g, iri, rdfsSubClassOf)
  // Many universal properties, like label and comment, have rdfs:Resource in their domain
  .add(rdfsResource)
  // For each class, find properties on their domain
  .forEach(klass => g[klass][_rdfsDomain] &&
    // For each property, add the property to the list and find its subProperties and their subProperties
    g[klass][_rdfsDomain].forEach(property => walkmap(g, property, _rdfsSubPropertyOf, properties)));

  const fieldConfigMap = {};

  properties.forEach(propertyIri => {
    const localName = g.getLocalName(propertyIri);

    if (fieldConfigMap[localName]) return console.log(`Warning: Duplicate localName with ${propertyIri} on fieldConfigMap of ${iri}`);

    const fieldConfig = getGraphqlFieldConfig(g, propertyIri);

    if (fieldConfig) fieldConfigMap[localName] = fieldConfig;
  });

  if (g.config.relay) fieldConfigMap.id = requireGraphqlRelay().globalIdField(getGraphqlName(g, iri), g.resolvers.resolveSourceId);
  if (!(g.config.preventIdField || fieldConfigMap.id)) {
    fieldConfigMap.id = {
      type: GraphQLID,
      resolve: g.resolvers.resolveSourceId,
    };
  }

  return fieldConfigMap;
}

module.exports = memorize(getGraphqlFieldConfigMap, 'graphqlFieldConfigMap');

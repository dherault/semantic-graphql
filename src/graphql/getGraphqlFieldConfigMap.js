const { GraphQLID } = require('graphql');
const { rdfsSubClassOf, rdfsResource, _rdfsDomain, _rdfsSubPropertyOf } = require('../constants');
const getIriLocalName = require('../utils/getIriLocalName');
const memorize = require('../graph/memorize');
const { walkmap } = require('../graph/traversal');
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
  .forEach(classIri => g[classIri][_rdfsDomain] &&
    // For each property, add the property to the list and find its subProperties and their subProperties
    g[classIri][_rdfsDomain].forEach(property => walkmap(g, property, _rdfsSubPropertyOf, properties)));

  const fieldConfigMap = {};
  const fieldConfigExtensionMap = g[iri].graphqlFieldConfigExtensions || {}; // From userland

  // Add id field
  if (g.config.relay) {
    fieldConfigMap.id = requireGraphqlRelay().globalIdField(getGraphqlName(g, iri), g.resolvers.resolveSourceId);
  }
  else if (!g.config.preventIdField) {
    fieldConfigMap.id = {
      type: GraphQLID,
      description: 'A unique identifier for the resource',
      resolve: (source, args, context, info) => g.resolvers.resolveSourceId(source, context, info),
    };
  }

  // Add other fields
  properties.forEach(propertyIri => {
    const localName = getIriLocalName(propertyIri);

    if (fieldConfigMap[localName]) return console.log(`Warning: Duplicate localName with ${propertyIri} on fieldConfigMap of ${iri}`);

    const fieldConfig = getGraphqlFieldConfig(g, propertyIri);

    if (fieldConfig) fieldConfigMap[localName] = Object.assign(fieldConfig, fieldConfigExtensionMap[propertyIri]);
  });

  return fieldConfigMap;
}

module.exports = memorize(getGraphqlFieldConfigMap, 'graphqlFieldConfigMap');

const { rdfsSubClassOf, rdfsResource, _rdfsDomain, _rdfsSubPropertyOf } = require('../constants');
const { walkmap } = require('../walkGraph');
const getGraphqlFieldConfig = require('./getGraphqlFieldConfig');
// const memorize = require('../memorize'); // NOTE: when interfaces show up

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

  properties.forEach(property => {
    const localName = g.getLocalName(property);

    if (fieldConfigMap[localName]) return console.log(`Warning: Duplicate localName with ${property} on fieldConfigMap of ${iri}`);

    const fieldConfig = getGraphqlFieldConfig(g, property);

    if (fieldConfig) fieldConfigMap[localName] = fieldConfig;
  });

  return fieldConfigMap;
}

module.exports = getGraphqlFieldConfigMap;

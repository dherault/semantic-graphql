const getIriLocalName = require('../utils/getIriLocalName');
const memorize = require('../graph/memorize');
const capitalize = require('../utils/capitalize');

// GraphQL-safe name for GraphQL types
function getGraphqlName(g, iri) {
  const { prefixes } = g.config;
  const localName = getIriLocalName(iri);
  const namespaceIri = iri.slice(0, -localName.length);

  const prefix = Object.keys(prefixes).find(key => prefixes[key] === namespaceIri) || '';

  return capitalize(prefix + localName).replace(/\W/g, '_');
}

module.exports = memorize(getGraphqlName, 'graphqlName');

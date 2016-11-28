const memorize = require('../memorize');

// GraphQL-safe name
function getGraphqlName(g, iri) {
  const { prefixes } = g.config;
  const localName = g.getLocalName(iri);
  const namespaceIri = iri.slice(0, -localName.length);

  const prefix = Object.keys(prefixes).find(key => prefixes[key] === namespaceIri) || '';

  return (prefix + localName).replace(/\W/g, '_');
}

module.exports = memorize(getGraphqlName, 'graphqlName');

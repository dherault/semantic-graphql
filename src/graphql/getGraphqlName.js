const memorize = require('../memorize');

// GraphQL-safe name
function getGraphqlName(g, iri) {
  return g.getLocalName(iri).replace(/\W/g, '_');
}

module.exports = memorize(getGraphqlName, 'graphqlName');

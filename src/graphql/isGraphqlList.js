const { rdfType, owlFunctionalProperty } = require('../constants');
const memorize = require('../memorize');

function isGraphqlList(g, iri) {
  return !(g[iri][rdfType] && g[iri][rdfType].includes(owlFunctionalProperty));
}

module.exports = memorize(isGraphqlList, 'isGraphqlList');

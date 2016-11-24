const { rdfsLabel, rdfsComment } = require('../constants');
const memorize = require('../memorize');

function getGraphqlDescription(g, iri) {
  const label = g[iri][rdfsLabel] && g[iri][rdfsLabel][0] || '';
  const comment = g[iri][rdfsComment] && g[iri][rdfsComment][0];

  return `${label}${label && comment ? ' - ' : ''}${comment || ''}`;
}

module.exports = memorize(getGraphqlDescription, 'graphqlDescription');

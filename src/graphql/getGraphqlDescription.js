const { getLiteralValue } = require('n3').Util;
const { rdfsLabel, rdfsComment } = require('../constants');
const memorize = require('../graph/memorize');

function getGraphqlDescription(g, iri) {
  const label = g[iri][rdfsLabel] ? getLiteralValue(g[iri][rdfsLabel][0]) : '';
  const comment = g[iri][rdfsComment] && getLiteralValue(g[iri][rdfsComment][0]);

  return `${label}${label && comment ? ' - ' : ''}${comment || ''}`;
}

module.exports = memorize(getGraphqlDescription, 'graphqlDescription');

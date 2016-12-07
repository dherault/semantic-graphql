const { isLiteral, getLiteralValue, getLiteralLanguage } = require('n3').Util;
const { rdfsLabel, rdfsComment } = require('../constants');
const getIriLocalName = require('../utils/getIriLocalName');
const memorize = require('../graph/memorize');

const englishLocale = 'en';
const isLiteralWithLocale = locale => l => isLiteral(l) && getLiteralLanguage(l) === locale;

function findValueForLocale(literals, locale) {
  if (!literals) return null;

  const literal = literals.find(isLiteralWithLocale(locale))
    || literals.find(isLiteralWithLocale(englishLocale))
    || literals[0];

  return isLiteral(literal) ? getLiteralValue(literal) : null;
}

function getGraphqlDescription(g, iri) {
  // The default locale is "en", can be set with config.locale
  const { locale = englishLocale } = g.config;

  const label = findValueForLocale(g[iri][rdfsLabel], locale);
  const comment = findValueForLocale(g[iri][rdfsComment], locale);

  let description = label && getIriLocalName(iri) !== label ? label : '';

  if (comment) {
    if (description) description += ' - ';

    description += comment;
  }

  if (description && !description.endsWith('.')) description += '.';

  return description;
}

module.exports = memorize(getGraphqlDescription, 'graphqlDescription');

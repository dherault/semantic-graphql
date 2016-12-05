const { GraphQLList } = require('graphql');
const { xsdIri, rdfsLiteral, rdfsSubPropertyOf, rdfsRange } = require('../constants');
const { walklook } = require('../graph/traversal');
const memorize = require('../graph/memorize');
const requireGraphqlRelay = require('../requireGraphqlRelay');
const isGraphqlList = require('./isGraphqlList');
const getGraphqlDescription = require('./getGraphqlDescription');
const getGraphqlObjectType = require('./getGraphqlObjectType');
const getGraphqlScalarType = require('./getGraphqlScalarType');
const getGraphqlPolymorphicScalarType = require('./getGraphqlPolymorphicScalarType');
const getGraphqlPolymorphicObjectType = require('./getGraphqlPolymorphicObjectType');
const getGraphqlScalarResolver = require('./getGraphqlScalarResolver');
const getGraphqlObjectResolver = require('./getGraphqlObjectResolver');
const getRelayConnectionType = require('./getRelayConnectionType');

const isLiteral = iri => iri.startsWith(xsdIri) || iri === rdfsLiteral;

function getGraphqlFieldConfig(g, iri) {
  // console.log('getGraphqlFieldConfig', iri);

  // Look for a range, return it if found
  // Otherwise for each super-property, look for a range, if not found, check their super-properties and so on
  // In a breath-first manner
  const ranges = [...walklook(g, iri, rdfsSubPropertyOf, rdfsRange)];
  const nRanges = ranges.length;

  if (!nRanges) return;

  const fieldConfig = {
    description: getGraphqlDescription(g, iri),
  };

  if (ranges.every(isLiteral)) {
    fieldConfig.resolve = getGraphqlScalarResolver(g, iri);
    fieldConfig.type = nRanges === 1 ? getGraphqlScalarType(g, ranges[0]) : getGraphqlPolymorphicScalarType(g, ranges);
  }
  else if (ranges.some(isLiteral)) {
    return console.log(`Warning: mixed literal/non-literal ranges on ${iri}:\n${ranges}`);
  }
  else {
    fieldConfig.resolve = getGraphqlObjectResolver(g, iri, ranges);
    fieldConfig.type = nRanges === 1 ? getGraphqlObjectType(g, ranges[0]) : getGraphqlPolymorphicObjectType(g, ranges);
  }

  if (isGraphqlList(g, iri)) fieldConfig.type = new GraphQLList(fieldConfig.type);

  if (g.config.relay && g[iri].isRelayConnection) {
    fieldConfig.args = requireGraphqlRelay().connectionArgs;
    fieldConfig.type = getRelayConnectionType(g, ranges[0]);
  }

  // Support partial overrides from user
  // full override is achieved with the memorize wrapper
  if (typeof g[iri].graphqlFieldConfigExtension === 'object') Object.assign(fieldConfig, g[iri].graphqlFieldConfigExtension);

  return fieldConfig;
}

module.exports = memorize(getGraphqlFieldConfig, 'graphqlFieldConfig');

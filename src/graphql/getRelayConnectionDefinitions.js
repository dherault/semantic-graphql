const requireGraphqlRelay = require('../requireGraphqlRelay');
const memorize = require('../graph/memorize');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const getGraphqlObjectType = require('./getGraphqlObjectType');

function getRelayConnectionDefinitions(g, iri) {
  if (g.config.relay) {
    return requireGraphqlRelay().connectionDefinitions({
      nodeType: getGraphqlObjectType(g, iri),
    });
  }
}

module.exports = ensureResourceExistance(memorize(getRelayConnectionDefinitions, 'relayConnectionDefinitions'));

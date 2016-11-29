const requireGraphqlRelay = require('../requireGraphqlRelay');
const memorize = require('../graph/memorize');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const getGraphqlObjectType = require('./getGraphqlObjectType');

function getRelayConnectionType(g, iri) {
  if (g.config.relay) {

    const nodeType = getGraphqlObjectType(g, iri);

    return requireGraphqlRelay().connectionDefinitions({ nodeType }).connectionType;
  }
}

module.exports = ensureResourceExistance(memorize(getRelayConnectionType, 'relayConnectionType'));

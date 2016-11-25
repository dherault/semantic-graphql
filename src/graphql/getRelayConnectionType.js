const requireGraphqlRelay = require('../requireGraphqlRelay');
const memorize = require('../memorize');
const getGraphqlObjectType = require('./getGraphqlObjectType');

function getRelayConnectionType(g, iri) {
  if (g.config.relay) {

    const nodeType = getGraphqlObjectType(g, iri);

    return requireGraphqlRelay().connectionDefinitions({ nodeType }).connectionType;
  }
}

module.exports = memorize(getRelayConnectionType, 'relayConnectionType');

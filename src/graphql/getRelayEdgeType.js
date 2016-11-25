const requireGraphqlRelay = require('../requireGraphqlRelay');
const memorize = require('../memorize');
const getGraphqlObjectType = require('./getGraphqlObjectType');

// Yes this can be dryer
function getRelayEdgeType(g, iri) {
  if (g.config.relay) {

    const nodeType = getGraphqlObjectType(g, iri);

    return requireGraphqlRelay().connectionDefinitions({ nodeType }).edgeType;
  }
}

module.exports = memorize(getRelayEdgeType, 'relayEdgeType');

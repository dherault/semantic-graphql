const requireGraphqlRelay = require('../requireGraphqlRelay');
const memorize = require('../graph/memorize');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const getGraphqlObjectType = require('./getGraphqlObjectType');

// Yes this can be dryer
function getRelayEdgeType(g, iri) {
  if (g.config.relay) {

    const nodeType = getGraphqlObjectType(g, iri);

    return requireGraphqlRelay().connectionDefinitions({ nodeType }).edgeType;
  }
}

module.exports = ensureResourceExistance(memorize(getRelayEdgeType, 'relayEdgeType'));

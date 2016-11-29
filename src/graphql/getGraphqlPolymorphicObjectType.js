const { rdfsResource } = require('../constants');
const getGraphqlInterfaceType = require('./getGraphqlInterfaceType');

function getGraphqlPolymorphicObjectType(g/*, ranges*/) {
  // TODO
  return getGraphqlInterfaceType(g, rdfsResource);
}

module.exports = getGraphqlPolymorphicObjectType;

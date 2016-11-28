const { rdfsResource } = require('../constants');
const getGraphqlInterfaceType = require('./getGraphqlInterfaceType');

function getGraphqlPolymorphicObjectType(g, ranges) {
  // throw new Error('getGraphqlPolymorphicObjectType');

  return getGraphqlInterfaceType(g, rdfsResource);
}

module.exports = getGraphqlPolymorphicObjectType;

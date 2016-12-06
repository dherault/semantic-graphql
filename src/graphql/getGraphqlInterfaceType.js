const { GraphQLInterfaceType } = require('graphql');
const memorize = require('../graph/memorize');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const getGraphqlName = require('./getGraphqlName');

function getGraphqlInterfaceType(g, iri) {

  return new GraphQLInterfaceType({
    name: `${getGraphqlName(g, iri)}Interface`,
    description: `Interface for ${iri}`,
    fields: () => require('./getGraphqlFieldConfigMap')(g, iri), // dynamic require to prevent require cycles
  });
}

module.exports = ensureResourceExistance(memorize(getGraphqlInterfaceType, 'graphqlInterfaceType'));

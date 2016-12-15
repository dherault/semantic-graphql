const { GraphQLObjectType } = require('graphql');
const memorize = require('../graph/memorize');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const getGraphqlName = require('./getGraphqlName');
const getGraphqlDescription = require('./getGraphqlDescription');

function getGraphqlObjectType(g, iri) {

  return new GraphQLObjectType({
    name: getGraphqlName(g, iri),
    description: getGraphqlDescription(g, iri),
    fields: () => require('./getGraphqlFieldConfigMap')(g, iri), // dynamic require to prevent require cycles
    interfaces: () => require('./getGraphqlInterfaces')(g, iri),
  });
}

module.exports = ensureResourceExistance(memorize(getGraphqlObjectType, 'graphqlObjectType'));

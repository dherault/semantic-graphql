const { GraphQLObjectType } = require('graphql');
const getGraphqlName = require('./getGraphqlName');
const getGraphqlDescription = require('./getGraphqlDescription');
const memorize = require('../memorize');

function getGraphqlObjectType(g, iri) {

  return new GraphQLObjectType({
    name: getGraphqlName(g, iri),
    description: getGraphqlDescription(g, iri),
    fields: () => require('./getGraphqlFieldConfigMap')(g, iri), // dynamic require to prevent require cycles
    interfaces: () => require('./getGraphqlInterfaces')(g, iri),
  });
}

module.exports = memorize(getGraphqlObjectType, 'graphqlObjectType');

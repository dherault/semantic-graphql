const { GraphQLInterfaceType } = require('graphql');
const memorize = require('../memorize');
const isValidIri = require('../utils/isValidIri');
const getGraphqlName = require('./getGraphqlName');
const getGraphqlObjectType = require('./getGraphqlObjectType');
const getGraphqlFieldConfigMap = require('./getGraphqlFieldConfigMap');

function getGraphqlInterfaceType(g, iri) {

  return new GraphQLInterfaceType({
    name: `${getGraphqlName(g, iri)}Interface`,
    description: `Interface for ${iri}`,
    fields: () => getGraphqlFieldConfigMap(g, iri),
    resolveType: (source, info) => {
      const iri = g.resolvers.resolveSourceClassIri(source, info);

      return isValidIri(iri) ? getGraphqlObjectType(g, iri) : null;
    },
  });
}

module.exports = memorize(getGraphqlInterfaceType, 'graphqlInterfaceType');

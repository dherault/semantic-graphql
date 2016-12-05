const { GraphQLInterfaceType } = require('graphql');
const memorize = require('../graph/memorize');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const isIri = require('../utils/isIri');
const getGraphqlName = require('./getGraphqlName');
const getGraphqlObjectType = require('./getGraphqlObjectType');

function getGraphqlInterfaceType(g, iri) {

  return new GraphQLInterfaceType({
    name: `${getGraphqlName(g, iri)}Interface`,
    description: `Interface for ${iri}`,
    fields: () => require('./getGraphqlFieldConfigMap')(g, iri),
    resolveType: (source, info) => {
      const iri = g.resolvers.resolveSourceClassIri(source, info);

      return isIri(iri) ? getGraphqlObjectType(g, iri) : null;
    },
  });
}

module.exports = ensureResourceExistance(memorize(getGraphqlInterfaceType, 'graphqlInterfaceType'));

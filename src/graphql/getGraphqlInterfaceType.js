const { GraphQLInterfaceType } = require('graphql');
const { rdfIri, rdfsIri, owlIri } = require('../constants');
const memorize = require('../memorize');
const isValidIri = require('../utils/isValidIri');
const getGraphqlName = require('./getGraphqlName');
const getGraphqlObjectType = require('./getGraphqlObjectType');
const getGraphqlFieldConfigMap = require('./getGraphqlFieldConfigMap');

function getGraphqlInterfaceType(g, iri) {

  let name = `${getGraphqlName(g, iri)}Interface`;

  // HACK until better is found, to prevent duplicates
  if (iri.startsWith(rdfIri)) name = `rdf${name}`;
  if (iri.startsWith(rdfsIri)) name = `rdfs${name}`;
  if (iri.startsWith(owlIri)) name = `owl${name}`;

  return new GraphQLInterfaceType({
    name,
    description: `Interface for ${iri}`,
    fields: () => getGraphqlFieldConfigMap(g, iri),
    resolveType: (source, info) => {
      const iri = g.resolvers.resolveSourceClassIri(source, info);

      return isValidIri(iri) ? getGraphqlObjectType(g, iri) : null;
    },
  });
}

module.exports = memorize(getGraphqlInterfaceType, 'graphqlInterfaceType');

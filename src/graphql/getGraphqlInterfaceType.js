const { GraphQLInterfaceType } = require('graphql');
const { rdfIri, rdfsIri, owlIri } = require('../constants');
const memorize = require('../memorize');
const isValidIri = require('../utils/isValidIri');
const getGraphqlName = require('./getGraphqlName');
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
      const iri = g.resolvers.resolveClassIri(source, info);

      return isValidIri(iri) && g[iri] ? g[iri].graphqlObjectType : null;
    },
  });
}

module.exports = memorize(getGraphqlInterfaceType, 'graphqlInterfaceType');

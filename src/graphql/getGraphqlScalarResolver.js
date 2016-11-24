function getGraphqlScalarResolver(g, iri) {
  return source => g.resolvers.resolveFieldValue(source, iri, g.getLocalName(iri));
}

module.exports = getGraphqlScalarResolver;

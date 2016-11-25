function getGraphqlScalarResolver(g, iri) {
  return (source, context, info) => g.resolvers.resolveSourceValue(source, iri, context, info);
}

module.exports = getGraphqlScalarResolver;

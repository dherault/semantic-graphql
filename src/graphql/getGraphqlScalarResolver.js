function getGraphqlScalarResolver(g, iri) {
  return (source, context, info) => g.resolvers.resolveSourcePropertyValue(source, iri, context, info);
}

module.exports = getGraphqlScalarResolver;

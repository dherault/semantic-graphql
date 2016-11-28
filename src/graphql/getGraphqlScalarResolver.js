function getGraphqlScalarResolver(g, iri) {
  return (source, args, context, info) => g.resolvers.resolveSourcePropertyValue(source, iri, context, info);
}

module.exports = getGraphqlScalarResolver;

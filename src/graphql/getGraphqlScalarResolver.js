const isValidIri = require('../utils/isValidIri');
const isGraphqlList = require('./isGraphqlList');

function getGraphqlScalarResolver(g, iri) {
  return (source, args, context, info) => {

    // If the source is an IRI, we are dealing with an in-graph individual
    if (isValidIri(source)) {

      if (g[source] && g[source][iri]) {
        const data = g[source][iri];

        if (isGraphqlList(iri)) return data; // XXX: should map getLiteralValue

        return data[0]; // XXX: should deal with locales
      }

      return null;
    }

    // Otherwise go to userland
    return g.resolvers.resolveSourcePropertyValue(source, iri, context, info);
  };
}

module.exports = getGraphqlScalarResolver;

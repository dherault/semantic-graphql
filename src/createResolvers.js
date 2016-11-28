const { rdfType, _rdfType } = require('./constants');
const isValidIri = require('./utils/isValidIri');
const isGraphqlList = require('./graphql/isGraphqlList');

function createResolvers(g, externalResolvers) {

  const isInternal = source => isValidIri(source) && g[source];

  return {
    resolveSourceId(source, context, info) {
      if (!isInternal(source)) return externalResolvers.resolveSourceId(source, context, info);

      return source;
    },

    resolveSourcePropertyValue(source, iri, context, info) {
      if (!isInternal(source)) return externalResolvers.resolveSourcePropertyValue(source, iri, context, info);

      const data = g[source][iri];
      const isList = isGraphqlList(g, iri);

      if (data) {
        if (isList) return data; // XXX: should map getLiteralValue when literal

        return data[0]; // XXX: should deal with locales when literal
      }

      return isList ? [] : null;
    },

    resolveSourceClassIri(source, context, info) {
      if (!isInternal(source)) return externalResolvers.resolveSourceClassIri(source, context, info);

      return g[source][rdfType][0]; // TODO: review that
    },

    resolveResource(id, context, info) {
      if (!isInternal(id)) return externalResolvers.resolveResource(id, context, info);

      return id;
    },

    resolveResources(ids, context, info) {
      // Not good enough; what about mixed data external/internal?
      if (ids.every(id => !isInternal(id))) return externalResolvers.resolveResources(ids, context, info);

      return ids;
    },

    resolveResourcesByPredicate(types, iri, value, context, info) {
      const externalResults = externalResolvers.resolveResourcesByPredicate(types, iri, value, context, info);
      const internalReferences = new Set();

      types.forEach(type => {
        if (!g[type][_rdfType]) return;

        g[type][_rdfType].forEach(internalReferences.add, internalReferences);
      });

      if (!internalReferences.size) return externalResults;

      const internalResults = [];

      internalReferences.forEach(ref => {
        if (g[ref][iri] && g[ref][iri].includes(value)) internalResults.push(ref);
      });

      return Promise.resolve(externalResults).then(results => internalReferences.concat(results));
    },
  };
}

module.exports = createResolvers;

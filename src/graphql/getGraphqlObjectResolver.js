const { owlInverseOf, _owlInverseOf, rdfsRange, rdfsDomain, _subClassOf } = require('../constants');
const { walkmap } = require('../walkGraph');
const isValidIri = require('../utils/isValidIri');
const isGraphqlList = require('./isGraphqlList');
const requireGraphqlRelay = require('../requireGraphqlRelay');

function getGraphqlObjectResolver(g, iri) {
  const { resolvers } = g;
  const isList = isGraphqlList(g, iri);

  let inverseOfMap;

  // If inverseProperties exists, we can use them to retrieve missing remote data
  if (g[iri][owlInverseOf] || g[iri][_owlInverseOf]) {
    const extendedRanges = new Set();
    const inverseProperties = new Set();

    if (g[iri][owlInverseOf]) g[iri][owlInverseOf].forEach(inverseProperties.add, inverseProperties);
    if (g[iri][_owlInverseOf]) g[iri][_owlInverseOf].forEach(inverseProperties.add, inverseProperties);

    // We want to look for the full extent of the currentProperty's range, i.e. include its subClasses
    g[iri][rdfsRange].forEach(rangeIri => walkmap(g, rangeIri, _subClassOf, extendedRanges));

    // For each inverseProperty we map the corresponding classes
    // That are both of the currentProperty's extended range and the inverseProperty's domain
    // NOTE: should we extend the inverseProperty's domain as well?
    inverseOfMap = new Map();

    inverseProperties.forEach(propertyIri => {
      if (!g[propertyIri][rdfsDomain]) return;

      const admitingRanges = g[propertyIri][rdfsDomain].filter(domainIri => extendedRanges.has(domainIri));

      inverseOfMap.set(propertyIri, admitingRanges);
    });
  }

  // XXX: put outside of scope to avoid re-allocation ?
  // The actual resolve function
  const resolver = (source, args, context, info) => {

    // If the source is an IRI, we are dealing with an in-graph individual
    if (isValidIri(source)) {
      if (g[source] && g[source][iri]) {
        const data = g[source][iri];

        return isList ? data : data[0];
      }

      return isList ? [] : null;
    }

    const ref = resolvers.resolveSourcePropertyValue(source, iri);

    if (ref === null) return null;

    if (typeof ref !== 'undefined') {
      return isList ?
        resolvers.resolveResources(Array.isArray(ref) ? ref : [ref], context, info) :
        resolvers.resolveResource(Array.isArray(ref) ? ref[0] : ref, context, info);
    }

    if (inverseOfMap && inverseOfMap.size) {

      const sourceId = resolvers.resolveSourceId(source, context, info);
      const promises = [];

      inverseOfMap.forEach((admitingRanges, propertyIri) => {
        promises.push(resolvers.resolveResourcesByPredicate(admitingRanges, propertyIri, sourceId, context, info));
      });

      return Promise.all(promises).then(results => {
        const finalResult = results.reduce((a, b) => a.concat(b), []);

        return isList ? finalResult : finalResult[0];
      });
    }

    return null;
  };

  if (g.config.relay && g[iri].isRelayConnection) {
    const { connectionFromArray, connectionFromPromisedArray } = requireGraphqlRelay();

    return (node, args, context, info) => {
      const results = resolver(node, args, context, info);

      return (Array.isArray(results) ? connectionFromArray : connectionFromPromisedArray)(results, args);
    };
  }

  return resolver;
}

module.exports = getGraphqlObjectResolver;

const { owlInverseOf, _owlInverseOf, rdfsDomain, _rdfsSubClassOf } = require('../constants');
const isNil = require('../utils/isNil');
const castArrayShape = require('../utils/castArrayShape');
const promisify = require('../utils/promisify');
const { walkmap } = require('../graph/traversal');
const isGraphqlList = require('./isGraphqlList');
const requireGraphqlRelay = require('../requireGraphqlRelay');

function getGraphqlObjectResolver(g, iri, ranges) {
  const { resolvers } = g;
  const isList = isGraphqlList(g, iri);

  let inverseOfMap;

  // If inverseProperties exists, we can use them to retrieve missing remote data
  if (g[iri][owlInverseOf] || g[iri][_owlInverseOf]) {
    const extendedRanges = new Set();
    const inverseProperties = new Set();

    if (g[iri][owlInverseOf]) g[iri][owlInverseOf].forEach(inverseProperties.add, inverseProperties);
    if (g[iri][_owlInverseOf]) g[iri][_owlInverseOf].forEach(inverseProperties.add, inverseProperties);

    // We want to look for the full extent of the currentProperty's ranges, i.e. include their subClasses
    ranges.forEach(rangeIri => walkmap(g, rangeIri, _rdfsSubClassOf, extendedRanges));

    // For each inverseProperty we map the corresponding classes
    // That are both of the currentProperty's extended range and the inverseProperty's extended domain
    inverseOfMap = new Map();

    inverseProperties.forEach(propertyIri => {
      if (!g[propertyIri][rdfsDomain]) return;

      const admitingRanges = [];
      const extendedDomains = new Set();

      // Find the extended domain of the inverseProperty
      g[propertyIri][rdfsDomain].forEach(domainIri => walkmap(g, domainIri, _rdfsSubClassOf, extendedDomains));

      // And among those domain, keep only those accepted as a range of the currentProperty
      extendedDomains.forEach(domainIri => {
        if (extendedRanges.has(domainIri)) admitingRanges.push(domainIri);
      });

      inverseOfMap.set(propertyIri, admitingRanges);
    });
  }

  // XXX: put outside of scope to avoid re-allocation ?
  // The actual resolve function
  const resolver = (source, args, context, info) => promisify(resolvers.resolveSourcePropertyValue(source, iri, context, info))
  .then(ref => {

    if (!isNil(ref)) {
      return (isList ? resolvers.resolveResources : resolvers.resolveResource)(castArrayShape(ref, isList), context, info);
    }

    // No reference(s) to data was resolved, maybe the data is on an inverse Property
    if (inverseOfMap && inverseOfMap.size) {

      return promisify(resolvers.resolveSourceId(source, context, info))
      .then(sourceId => {

        const promises = [];

        inverseOfMap.forEach((admitingRanges, propertyIri) => {
          promises.push(resolvers.resolveResourcesByPredicate(admitingRanges, propertyIri, sourceId, context, info));
        });

        return Promise.all(promises)
        .then(results => {
          const finalResult = results.reduce((a, b) => a.concat(b), []);

          return isList ? finalResult : finalResult[0];
        });
      });
    }

    // Give up
    return isList ? [] : null;
  });

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

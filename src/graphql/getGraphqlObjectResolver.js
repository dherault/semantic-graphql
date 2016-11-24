const isGraphqlList = require('./isGraphqlList');

function getGraphqlObjectResolver(g, iri) {
  const localName = g.getLocalName(iri);
  const isList = isGraphqlList(g, iri);
  const resolveValue = g.resolvers.resolveFieldValue;
  const resolveRef = isList ? g.resolvers.resolveIds : g.resolvers.resolveId;

  console.log('__getGraphqlObjectResolver', iri);
  // process.exit();

  return source => {
    const ref = resolveValue(source, iri, localName);

    if (ref === null) return null;

    if (typeof ref !== 'undefined') {
      return isList ?
        resolveRef(Array.isArray(ref) ? ref : [ref]) :
        resolveRef(Array.isArray(ref) ? ref[0] : ref);
    }

    /*
      New polymorphic deal:
      forEach(inverseProperty)
        find class on range that admit the property, including subclasses
        invoke resolveNodesByTypeAndKeyValue with multiple types
    */

    return null;
    // TODO: inverseOf
  };
}

module.exports = getGraphqlObjectResolver;

const isNil = require('../utils/isNil');
const castArrayShape = require('../utils/castArrayShape');
const isGraphqlList = require('./isGraphqlList');

function getGraphqlScalarResolver(g, iri) {
  const isList = isGraphqlList(g, iri);

  return (source, args, context, info) => Promise.resolve(g.resolvers.resolveSourcePropertyValue(source, iri, context, info))
  // We try to return data that is consistant with the property definition
  // i.e. if it's a list, return an Array
  .then(result => isNil(result) ? isList ? [] : null : castArrayShape(result, isList));
}

module.exports = getGraphqlScalarResolver;

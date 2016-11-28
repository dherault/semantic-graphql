const resolverNames = [
  'resolveSourceId',
  'resolveSourcePropertyValue',
  'resolveSourceClassIri',
  'resolveResource',
  'resolveResources',
  'resolveResourcesByPredicate',
];

// Asserts that the inputed object has resolverNames within its key and functions as underlying values
function validateResolvers(resolvers) {
  resolverNames.forEach(key => {
    const type = typeof resolvers[key];

    if (type !== 'function') throw new Error(`Resolver validation: expected "${key}" to be a function, got ${type} instead.`);
  });

  return resolvers;
}

module.exports = validateResolvers;

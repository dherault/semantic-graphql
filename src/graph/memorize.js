// Caches the result of a function in the graph
// Allows user override
// Makes sure the a (deterministic/pure) function is not called twice with the same args
function memorize(fn, key) {
  return (g, iri) => typeof g[iri][key] !== 'undefined' ? g[iri][key] : g[iri][key] = fn(g, iri);
}

module.exports = memorize;

function memorize(fn, key) {
  return (g, iri) => typeof g[iri][key] !== 'undefined' ? g[iri][key] : g[iri][key] = fn(g, iri);
}

module.exports = memorize;

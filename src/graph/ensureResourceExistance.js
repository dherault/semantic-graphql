const invariant = require('../utils/invariant');

function ensureResourceExistance(fn) {
  return (g, iri) => {
    invariant(typeof g[iri] === 'object', `Could not find the following resource: ${iri}`);

    return fn(g, iri);
  };
}

module.exports = ensureResourceExistance;

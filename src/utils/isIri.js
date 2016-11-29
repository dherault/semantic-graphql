function isIri(iri) {
  return typeof iri === 'string' && iri.startsWith('http'); // very basic check
}

module.exports = isIri;

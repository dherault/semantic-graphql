function isValidIri(iri) {
  return typeof iri === 'string' && iri.startsWith('http'); // very basic check
}

module.exports = isValidIri;

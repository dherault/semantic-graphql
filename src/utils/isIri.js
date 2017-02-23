function isIri(iri) {
  // According to: https://tools.ietf.org/html/rfc3987#section-2
  // IRI            = scheme ":" ihier-part [ "?" iquery ] [ "#" ifragment ]
  // every IRI requires a scheme followed by ":".
  return typeof iri === 'string' && iri.includes(':'); 
}

module.exports = isIri;

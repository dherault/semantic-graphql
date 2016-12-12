const warn = require('../utils/warn');

// Both methods walk a graph: g
// from a given vertex (:=startVertex): iri

// Adds startVertex to the output
// exits startVertex using a given edge: walkIri, and recurse on the result
function walkmap(g, iri, walkIri, s = new Set()) {
  if (s.has(iri)) return s; // Prevents cycles
  if (!g[iri]) return warn(`Resource missing in graph: ${iri}`) || s;

  s.add(iri);

  if (g[iri][walkIri]) g[iri][walkIri].forEach(wIri => walkmap(g, wIri, walkIri, s));

  return s;
}

// Adds vertices connected to startVertex by a given edge: lookIri, to the output
// if the output is not empty returns the output
// else exit startVertex using a given edge: walkIri, and recurse on the result
function walklook(g, iri, walkIri, lookIri, s = new Set(), ws = new Set()) {
  if (ws.has(iri)) return s; // Prevents cycles
  if (!g[iri]) return warn(`Resource missing in graph: ${iri}`) || s;

  ws.add(iri);

  if (g[iri][lookIri]) g[iri][lookIri].forEach(lIri => s.add(lIri));

  if (s.size) return s;

  if (g[iri][walkIri]) g[iri][walkIri].forEach(wIri => walklook(g, wIri, walkIri, lookIri, s, ws));

  return s;
}

module.exports = {
  walkmap,
  walklook,
};

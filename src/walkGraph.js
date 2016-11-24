// Walks a graph: g
// From a given vertex: iri
// exiting a vertex using a given edge: walkIri
// and adding every vertex found into the output
function walkmap(g, iri, walkIri, s = new Set()) {
  if (s.has(iri)) return s; // Prevents cycles

  s.add(iri);

  if (g[iri][walkIri]) g[iri][walkIri].forEach(wIri => walkmap(g, wIri, walkIri, s));

  return s;
}

// Walks a graph: g
// From a given vertex: iri
// Looks for vertices (:lookedVertices) connected with a given edge: lookIri
// Adds each lookedVertices to the output
// If the output is not empty returns the output
// Else exits iri and recurse using a given edge: walkIri
function walklook(g, iri, walkIri, lookIri, s = new Set(), ws = new Set()) {
  if (ws.has(iri)) return s; // Prevents cycles

  ws.add(iri);

  const lookResults = g[iri][lookIri];

  if (lookResults) lookResults.forEach(lIri => s.add(lIri));

  if (s.size) return s;

  const walkResult = g[iri][walkIri];

  if (walkResult) walkResult.forEach(wIri => walklook(g, wIri, walkIri, lookIri, s, ws));

  return s;
}

module.exports = {
  walkmap,
  walklook,
};

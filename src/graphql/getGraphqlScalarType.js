const { graphqlScalarTypes } = require('../scalars');

function getGraphqlScalarType(g, iri) {
  const type = graphqlScalarTypes[g.getLocalName(iri)];

  if (!type) throw new Error(`getGraphqlScalarType ${iri})`);

  return type;
}

module.exports = getGraphqlScalarType;

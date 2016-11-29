const { graphqlScalarTypes } = require('../scalars');
const getIriLocalName = require('../utils/getIriLocalName');

function getGraphqlScalarType(g, iri) {
  const type = graphqlScalarTypes[getIriLocalName(iri)];

  if (!type) throw new Error(`getGraphqlScalarType ${iri})`);

  return type;
}

module.exports = getGraphqlScalarType;

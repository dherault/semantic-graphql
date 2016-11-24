const { GraphQLScalarType } = require('graphql');
const ArrayKeyedMap = require('../ArrayKeyedMap');
const { graphqlScalarTypes, graphqlScalarMethods } = require('../scalars');

const memory = new ArrayKeyedMap();

function getGraphqlPolymorphicScalarType(g, ranges) {
  if (memory.has(ranges)) return memory.get(ranges);

  // Polymorphic range: not cached, so we create it
  // NOTE: The current implementation uses the ordered ranges to pick the prefered type when
  // multiple types are available. (typically float and integer, string and id, etc...)
  const localNames = ranges.map(range => g.getLocalName(range));
  const scalarTypes = localNames.map(localName => graphqlScalarTypes[localName]);

  if (scalarTypes.some(type => !type)) throw new Error(`Validate much? ranges: ${ranges}`);

  const scalarMethods = scalarTypes.map(type => graphqlScalarMethods.get(type));

  // No exception thrown here, GraphQL takes care of it
  const coerce = value => {
    const correctMethods = scalarMethods.filter(({ isOfType }) => isOfType(value));

    if (!correctMethods.length) return null;

    return correctMethods[0].coerce(value); // Favors precedence in graphqlScalarMethods
  };

  const type = new GraphQLScalarType({
    name: `Polymorphic_scalar_${localNames.join('_')}`,
    serialize: coerce,
    parseValue: coerce,
    parseLiteral: ast => scalarMethods
      .map(({ parseLiteral }) => parseLiteral(ast))
      .filter(value => value !== null)[0] || null,
  });

  memory.set(ranges, type);

  return type;
}

module.exports = getGraphqlPolymorphicScalarType;

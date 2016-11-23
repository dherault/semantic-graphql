const { GraphQLID, GraphQLBoolean, GraphQLInt, GraphQLFloat, GraphQLString, Kind } = require('graphql');

// https://www.w3.org/TR/xmlschema-2
// http://graphql.org/docs/api-reference-type-system/#graphqlscalartype
const graphqlScalarTypes = {
  /* --------------------
    Primitive datatypes
  -------------------- */
  string: GraphQLString,
  boolean: GraphQLBoolean,
  decimal: GraphQLFloat,
  float: GraphQLFloat,
  double: GraphQLFloat,
  duration: GraphQLString,
  dateTime: GraphQLString,
  time: GraphQLString,
  date: GraphQLString,
  gYearMonth: GraphQLString,
  gYear: GraphQLString,
  gMonthDay: GraphQLString,
  gDay: GraphQLString,
  gMonth: GraphQLString,
  hexBinary: GraphQLString,
  base64Binary: GraphQLString,
  anyURI: GraphQLString,
  QName: GraphQLString,
  NOTATION: GraphQLString,
  /* ------------------
    Derived datatypes
  ------------------ */
  normalizedString: GraphQLString,
  token: GraphQLString,
  language: GraphQLString,
  NMTOKEN: GraphQLString,
  // NMTOKENS: new GraphQLList(GraphQLString),
  Name: GraphQLString,
  NCName: GraphQLString,
  ID: GraphQLID,
  IDREF: GraphQLID,
  // IDREFS: new GraphQLList(GraphQLID),
  ENTITY: GraphQLString,
  // ENTITIES: new GraphQLList(GraphQLString),
  integer: GraphQLInt,
  nonPositiveInteger: GraphQLInt,
  negativeInteger: GraphQLInt,
  long: GraphQLInt,
  int: GraphQLInt,
  short: GraphQLInt,
  byte: GraphQLInt,
  nonNegativeInteger: GraphQLInt,
  unsignedLong: GraphQLInt,
  unsignedInt: GraphQLInt,
  unsignedShort: GraphQLInt,
  unsignedByte: GraphQLInt,
  positiveInteger: GraphQLInt,
};

// Not great
// The most inclusive types must be last
// example: float includes int, so float must be after int
const graphqlScalarMethods = new Map([
  [GraphQLBoolean, {
    isOfType: value => typeof value === 'boolean',
    coerceValue: Boolean,
    parseLiteral: ast => ast.kind === Kind.BOOLEAN ? ast.value : null,
  }],
  [GraphQLString, {
    isOfType: value => typeof value === 'string',
    coerce: String,
    parseLiteral: ast => ast.kind === Kind.STRING ? ast.value : null,
  }],
  [GraphQLInt, {
    isOfType: value => typeof value === 'number' && Math.round(value) === value,
    coerce(value) {
      if (value === '') return null;

      const number = Number(value);

      if (Math.abs(number) <= Number.MAX_SAFE_INTEGER) return (number < 0 ? Math.ceil : Math.floor)(number);

      return null;
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        const number = parseInt(ast.value, 10);

        if (Math.abs(number) <= Number.MAX_SAFE_INTEGER) return number;
      }

      return null;
    },
  }],
  [GraphQLFloat, {
    isOfType: value => typeof value === 'number',
    coerce(value) {
      if (value === '') return null;

      const number = Number(value);

      if (number === number) return number;

      return null;
    },
    parseLiteral: ast => ast.kind === Kind.FLOAT || ast.kind === Kind.INT ? parseFloat(ast.value) : null,
  }],
  // Must be last because it can be interpreted as either a string or a number
  [GraphQLID, {
    isOfType: value => typeof value === 'string' || typeof value === 'number',
    coerce: String,
    parseLiteral: ast => ast.kind === Kind.STRING || ast.kind === Kind.INT ? ast.value : null,
  }],
]);

module.exports = {
  graphqlScalarTypes,
  graphqlScalarMethods,
};

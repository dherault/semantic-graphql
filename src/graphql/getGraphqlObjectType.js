const { GraphQLObjectType } = require('graphql');
const { _rdfsSubClassOf } = require('../constants');
const isNil = require('../utils/isNil');
const castArrayShape = require('../utils/castArrayShape');
const memorize = require('../graph/memorize');
const { walkmap } = require('../graph/traversal');
const ensureResourceExistance = require('../graph/ensureResourceExistance');
const getGraphqlName = require('./getGraphqlName');
const getGraphqlDescription = require('./getGraphqlDescription');

function getGraphqlObjectType(g, iri) {

  // We look for all sub-classes of this rdfs:Class
  const classes = walkmap(g, iri, _rdfsSubClassOf);

  return new GraphQLObjectType({
    name: getGraphqlName(g, iri),
    description: getGraphqlDescription(g, iri),
    fields: () => require('./getGraphqlFieldConfigMap')(g, iri), // dynamic require to prevent require cycles
    interfaces: () => require('./getGraphqlInterfaces')(g, iri),
    isTypeOf: (value, info) => Promise.resolve(g.resolvers.resolveSourceTypes(value, info))
    .then(iris => !isNil(iris) && castArrayShape(iris).some(iri => classes.has(iri))),
  });
}

module.exports = ensureResourceExistance(memorize(getGraphqlObjectType, 'graphqlObjectType'));

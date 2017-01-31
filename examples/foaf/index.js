const fs = require('fs');
const path = require('path');
const { GraphQLSchema, GraphQLObjectType, printSchema } = require('graphql'); // eslint-disable-line import/no-extraneous-dependencies
const SemanticGraph = require('../..');

const mockFunction = () => null;
const resolvers = {
  resolveSourceId: mockFunction,
  resolveSourcePropertyValue: mockFunction,
  resolveSourceTypes: mockFunction,
  resolveResource: mockFunction,
  resolveResources: mockFunction,
  resolveResourcesByPredicate: mockFunction,
};

// First we create a SemanticGraph
const _ = new SemanticGraph(resolvers);

// Then we add our triples
_.parseFile(path.join(__dirname, './foaf.ttl'));

console.log(`graph created: ${_}`);

// Finally we can build our shema
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      person: {
        type: _.getObjectType('http://xmlns.com/foaf/0.1/Person'),
        resolve: () => ({}),
      },
    },
  }),
});

// Save schema in Schema language to disk
fs.writeFileSync(path.join(__dirname, './foaf.graphql'), printSchema(schema));
console.log('Schema saved on disk');

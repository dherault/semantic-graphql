const fs = require('fs');
const path = require('path');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, printSchema } = require('graphql'); // eslint-disable-line import/no-extraneous-dependencies
const graphqlHTTP = require('express-graphql');
const express = require('express');
const SemanticGraph = require('../..');

const data = require('./data');
const resolvers = require('./resolvers');

const _ = new SemanticGraph(resolvers, { owl: true });

console.log(`graph created: ${_}`);

_.parseFile(path.join(__dirname, './ontology.ttl'));

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      companies: {
        type: new GraphQLList(_.getObjectType('http://foo.com#Company')),
        descriptions: 'All the Companies in database.',
        resolve: () => data.filter(node => node.type === 'Company'),
      },
      thing: {
        // Using rdfs:Resource also works. It queries anything.
        // type: _.getInterfaceType('http://www.w3.org/2000/01/rdf-schema#Resource'),
        type: _.getInterfaceType('http://foo.com#Thing'),
        description: 'Anything you like, by id. Similar to Relay\'s node field.',
        args: {
          id: {
            type: GraphQLString,
            defaultValue: 'French',
          },
        },
        resolve: (_, { id }) => data.find(node => node.id === id),
      },
    },
  }),
});

fs.writeFileSync(path.join(__dirname, './schema.graphql'), printSchema(schema));
console.log('Schema saved on disk');

express()
.use('/graphql', graphqlHTTP({
  schema,
  pretty: true,
  graphiql: true,
}))
.listen(3000, err => console.log(err || 'GraphQL endpoint listening on port 3000\n'));

const path = require('path');
const { GraphQLSchema, GraphQLObjectType, GraphQLList } = require('graphql'); // eslint-disable-line import/no-extraneous-dependencies
const graphqlHTTP = require('express-graphql');
const express = require('express');
const Graph = require('../..');

const data = require('./data');
const resolvers = require('./resolvers');

const _ = new Graph(resolvers, { owl: true });

console.log(`Collection created: ${_}.\n`);

_.parseFile(path.join(__dirname, './ontology.ttl'));

// _.getGraphqlFieldConfigMap('http://foo.com#Person');

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      companies: {
        type: new GraphQLList(_.getObjectType('http://foo.com#Company')),
        descriptions: 'All the Companies in database.',
        resolve: () => data.filter(node => node.type === 'Company'),
      },
      // thing: {
      //   type: _.getInterfaceType('Thing'),
      //   description: 'Anything you like, by id. Similar to Relay\'s node field.',
      //   args: {
      //     id: {
      //       type: new GraphQLNonNull(GraphQLString),
      //     },
      //   },
      //   resolve: (_, { id }) => data.find(node => node.id === id),
      // },
    },
  }),
});

// return console.log(printSchema(schema));

express()
.use('/graphql', graphqlHTTP({
  schema,
  pretty: true,
  graphiql: true,
}))
.listen(3000, err => {
  if (err) return console.error(err);

  console.log('GraphQL endpoint listening on port 3000');
});

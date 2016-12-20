const path = require('path');
const { GraphQLSchema, GraphQLObjectType } = require('graphql'); // eslint-disable-line import/no-extraneous-dependencies
const graphqlHTTP = require('express-graphql');
const express = require('express');
const SemanticGraph = require('../..');

const data = require('./data');
const resolvers = require('./resolvers');

// You should check the basic example first
const _ = new SemanticGraph(resolvers, { relay: true });

console.log(`graph created: ${_}`);

_.parseFile(path.join(__dirname, './ontology.ttl'));

// Register connections
// This will add the proper mechanics around the field (ie the connectionArgs and the connectionResolver)
_['http://foo.com#hasComments'].isRelayConnection = true;

// Any part of the field can still be overriden with
// _['http://foo.com#hasComments'].graphqlFieldConfigExtension = { type: ..., resolve: ..., ...}
// Or the field can be overriden entirely using
// _['http://foo.com#hasComments'].graphqlFieldConfig = { type: ..., resolve: ..., ...}

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      article: {
        type: _.getObjectType('http://foo.com#Article'),
        descriptions: 'A cool article with paginated comments',
        resolve: () => data[0],
      },
      node: _.nodeField,
    },
  }),
});

express()
.use('/graphql', graphqlHTTP({
  schema,
  pretty: true,
  graphiql: true,
}))
.listen(3000, err => console.log(err || 'GraphQL endpoint listening on port 3000\n'));

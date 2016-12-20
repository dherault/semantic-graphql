const fs = require('fs');
const path = require('path');
const { GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, printSchema } = require('graphql'); // eslint-disable-line import/no-extraneous-dependencies
const graphqlHTTP = require('express-graphql');
const express = require('express');
const SemanticGraph = require('../..');

const data = require('./data');
const resolvers = require('./resolvers');

// First we create a SemanticGraph
const _ = new SemanticGraph(resolvers);

console.log(`graph created: ${_}`);

// Then we add our triples
_.parseFile(path.join(__dirname, './ontology.ttl'));

// Optionally we can tell semantic-graphql that in order to resolve foo:hasEmployees on foo:Company
// it should not look for the data on individuals of foo:Company,
// but use the owl:inverseOf properties on foo:hasEmployees (i.e. foo:worksForCompany on foo:Person).
// This could allows to save a trip to the database in some real world situations.
_['http://foo.com#hasEmployees'].shouldAlwaysUseInverseOf = true;

// Finally we can build our shema
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
            defaultValue: 'French', // of rdf:type foo:Language
          },
        },
        resolve: (_, { id }) => data.find(node => node.id === id),
      },
    },
  }),
});

// Save schema in Schema language to disk
fs.writeFileSync(path.join(__dirname, './schema.graphql'), printSchema(schema));
console.log('Schema saved on disk');

// Start server
express()
.use('/graphql', graphqlHTTP({
  schema,
  pretty: true,
  graphiql: true,
}))
.listen(3000, err => console.log(err || 'GraphQL endpoint listening on port 3000\n'));

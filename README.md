# Semantic GraphQL

*Create GraphQL schemas from RDF-based ontologies*

Semantic GraphQL provides an API to convert any [RDF](https://www.w3.org/TR/rdf11-primer/), [RDFS](https://www.w3.org/TR/rdf-schema/) and [OWL](http://www.w3.org/TR/owl-primer)-based ontologies into [GraphQL](http://graphql.org/) objects.

The library does not deal with data, only with terminology. Therefore resolving data/resources is up to you.

**Table of contents**:
- x
- y
- z

## Installation

Runs on Node v6 or higher.

`npm install semantic-graphql --save`

## Getting started

Semantic-graphql makes no assumption about the shape of your data and only passes it around. You have to provide six functions to resolve it in different ways. See the [resolvers section](#).

```javascript
const resolvers = { /* Choose how to resolve data */ };
```

Once your resolvers are written you can create a SemanticGraph. In the graph all the triples defining RDF, RDFS and OWL are included by default.

```javascript
const SemanticGraph = require('semantic-graphql');

const _ = new SemanticGraph(resolvers, config);
```

Now you can add your own triples. Only statements defining your terminology (classes + properties) will be used, so you shouldn't add your individuals as it will only consume memory.

```javascript
_.addTriple({
  subject: 'http://foo.com#MyClass',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2002/07/owl#Class',
});

// From a string or a file. Multiple formats are available.
_.parse(string);
_.parseFile('/path/to/ontology.ttl');
```

When Semantic-graphql translates a rdf:Property to a GraphQLFieldConfig, the resulting type will be wrapped in a GraphQLList unless the property is a owl:FunctionalProperty. Therefore you may have to do some adjustments in order to prevent that. Almost anything can be overriden, see the [override section](#).

```javascript
// We do not want rdfs:label to resolve arrays
_['http://www.w3.org/2000/01/rdf-schema#label'].isGraphqlList = false;
```

Now you can start building your GraphQL schema however you want.

```javascript
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      myField: {
        // GraphQL objects are created on demand using the API
        type: _.getObjectType('http://foo.com#MyClass'),
        resolve: /* ... */,
      },
      resource: {
        // The rdfs:Resource interface allows you to query any data
        type: _.getInterfaceType('http://www.w3.org/2000/01/rdf-schema#Resource'),
        args: {
          id: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: /* ... */,
      },
    },
  }),
});
```

Have a look at the [examples folder](#) to see a complete setup.

## Using relay

By using the `relay: true` option:

- The `_.nodeField` and `_.nodeInterface` object are available
- The `_.getConnectionType` and `_.getEdgeType` methods are available
- All ObjectTypes exhibit the Node interface
- The id field is a globalIdField

See the [Relay example](#).

## API

### SemanticGraph

### Resolvers

#### resolveSourceId

#### resolveSourceClassIri

#### resolveSourcePropertyValue

#### resolveResource

#### resolveResources

#### resolveResourcesByPredicate

## Overriding default values

To override anything there is no method: you directly set the library's internals.

```javascript
_['http://the.resource.to/be#altered'].key = value;
```

If "key" is already present, the library will use the underlying value and won't try to create it.

| Resource type | key | value type |
| ------------- | --- | ---------- |
| any | graphqlName | String |
| any | graphqlDescription | String |
| class | graphqlFieldConfigMap | GraphQLFieldConfigMap |
| class | graphqlObjectType | GraphQLObjectType |
| class | graphqlInterfaceType | GraphQLInterfaceType |
| class | relayConnectionType | ConnectionType |
| class | relayEdgeType | EdgeType |
| property | isGraphqlList | Boolean |
| property | graphqlFieldConfig | GraphQLFieldConfig |
| property | graphqlFieldConfigExtension | partial GraphQLFieldConfig, to modify only parts of it |

Note that the following overrides must be performed *before* invoking `getObjectType` or `getInterfaceType` or `getEdgeType` or `getConnectionType` since those methods create the GraphQL objects you want to override.

Example:
```javascript
_['http://foo.com#worksForCompany'].graphqlName = 'company';
// Now the field name for foo:worksForCompany will be 'company'

// Partial modifications to fields are achieved using
_['http://foo/com#worksForCompany'].graphqlFieldConfigExtension = {
  args: /* Look Ma', arguments! */
  resolve: customResolveFn,
};
```

## OWL features roadmap

- [x] owl:DatatypeProperty
- [x] owl:ObjectProperty
- [x] owl:FunctionalProperty
- [x] owl:inverseOf
- [ ] Class expressions (including Restrictions)
- [ ] owl:unionOf
- [ ] owl:intersectionOf
- [ ] owl:complementOf
- [ ] owl:equivalentClass
- [ ] owl:equivalentProperty
- [ ] owl:sameAs
- [ ] owl:disjointWith
- [ ] owl:differentFrom
- [ ] owl:ReflexiveProperty
- [ ] owl:SymmetricProperty
- [ ] owl:TransitiveProperty
- [ ] owl:AsymmetricProperty
- [ ] owl:IrreflexiveProperty
- [ ] owl:InverseFunctionalProperty

The following features will not be implemented due to their incomptability with GraphQL:

- Some items of the preceding list might be impossible to implement and end up here

## Contributing

Yes, thank you. Please lint, update/write tests and add your name to the package.json file before you PR.

## Licence

Semantic GraphQL is released under the MIT License.

GraphQL is released by Facebook, inc. under the [BSD-license](https://github.com/graphql/graphql-js/blob/master/LICENSE) with an additional [patent grant](https://github.com/graphql/graphql-js/blob/master/PATENTS).

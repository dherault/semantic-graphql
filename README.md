# Semantic GraphQL

[![npm version](https://badge.fury.io/js/semantic-graphql.svg)](https://www.npmjs.com/package/semantic-graphql)
[![Build Status](https://travis-ci.org/nelson-ai/semantic-graphql.svg?branch=master)](https://travis-ci.org/nelson-ai/semantic-graphql)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

Semantic GraphQL provides an API to convert any [RDF](https://www.w3.org/TR/rdf11-primer/), [RDFS](https://www.w3.org/TR/rdf-schema/) and [OWL](http://www.w3.org/TR/owl-primer)-based ontologies into [GraphQL](http://graphql.org/) objects.

The library does not deal with data, only with terminology. Therefore resolving data/resources is up to you.

**Table of contents:**

- [Installation](#installation)
- [Getting started](#getting-started)
- [SemanticGraph API](#semanticgraph-api)
- [Resolvers](#resolvers)
- [Overriding default values](#overriding-default-values)
- [Using Relay](#using-relay)
- [OWL features roadmap](#owl-features-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Installation

Runs on Node v6 or higher.

`npm install semantic-graphql --save`

## Getting started

Semantic-graphql makes no assumption about the shape of your data and only passes it around. You have to provide six functions to resolve it in different ways. See the [resolvers section](#resolvers).

```js
const resolvers = { /* Choose how to resolve data */ };
```

Once your resolvers are written you can create a SemanticGraph. In the graph all the triples defining RDF, RDFS and OWL are included by default.

```js
const SemanticGraph = require('semantic-graphql');

const _ = new SemanticGraph(resolvers, config);
```

Now you can add your own triples. Only statements defining your terminology (classes + properties) will be used, so you shouldn't add your individuals as it will only consume memory.

```js
_.addTriple({
  subject: 'http://foo.com#MyClass',
  predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  object: 'http://www.w3.org/2002/07/owl#Class',
});

// From a string or a file. Multiple formats are available.
_.parse(string);
_.parseFile('/path/to/ontology.ttl');
```

When Semantic-graphql translates a rdf:Property to a GraphQLFieldConfig, the resulting type will be wrapped in a GraphQLList unless the property is a owl:FunctionalProperty. Therefore you may have to do some adjustments in order to prevent that. Almost anything can be overriden, see the [override section](#overriding-default-values).

```js
// We do not want rdfs:label to resolve arrays
_['http://www.w3.org/2000/01/rdf-schema#label'].isGraphqlList = false;
```

Now you can start building your GraphQL schema however you want.

```js
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

Have a look at the [examples folder](examples/) to see a complete setup.

## SemanticGraph API

```
class SemanticGraph {
  constructor(resolvers: Resolvers, config: ?SemanticGraphConfig),
  nTriples: number,
  # The semantic data is stored directly on the graph
  [subject: Iri]: { [predicate: iri]: Array<object: string> },
  # Public methods:
  addTriple: AddTripleFn,
  parse: ParseFn,
  parseFile: ParseFileFn,
  getObjectType: GetObjectTypeFn,
  getInterfaceType: GetInterfaceTypeFn,
  getEdgeType: GetEdgeTypeFn,
  getConnectionType: GetConnectionTypeFn,
  addFieldOnObjectType: AddFieldOnObjectTypeFn,
  extendFieldOnObjectType: ExtendFieldOnObjectTypeFn,
  # When the relay option is on:
  nodeField: GraphQLFieldConfig,
  nodeInterface: GraphQLInterfaceType,
}

type SemanticGraphConfig = {
  prefixes?: PrefixConfig,
  # Activates the Relay features
  relay?: boolean,
  # Your reprefered locale when inferring names and descriptions from rdfs:label and rdfs:comment
  locale?: string = 'en',
  # Prevents the id field to be automatically added to every GraphlQLFieldConfigMap
  preventIdField?: boolean,
}
```

To prevent GraphQL names collisions, you can edit the name directly (see the [override section](#overriding-default-values))
or specifify prefixes for ontology namespaces.
The names of the generated GraphQL objects will be prefixed.
RDF, RDFS and OWL ontologies are by default prefixed with "rdf", "rdfs" and "owl".
So a fragment on rdfs:Resource should be "on RdfsResource".

```
type PrefixConfig = {
  [prefix: string]: Iri,
}

# Must represent a valid IRI
type Iri = string
```

### addTriple

```
type AddTripleFn(triple: Triple) => undefined

type Triple = {
  subject: Iri,
  predicate: Iri,
  object: Iri | string,
}
```

Appends a triple to the graph. No-op if the subject or predicate IRI is invalid, or if the triple already exists.

### parse

Deprecated

### parseFile

Deprecated

### getObjectType

```
type GetObjectTypeFn = (classIri: Iri) => GraphQLObjectType
```

Returns the GraphQLObjectType corresponding to a given individual of rdfs:Class or its sub-classes (like owl:Class). Throws if the IRI is not found in the graph.

### getInterfaceType

```
type GetInterfaceTypeFn = (classIri: Iri) => GraphQLInterfaceType
```

### getEdgeType

```
type GetEdgeTypeFn = (classIri: Iri) => ?RelayEdgeType
```

Returns a value only when the `relay: true` option is on.

### getConnectionType

```
type GetConnectionTypeFn = (classIri: Iri) => ?RelayConnectionType
```

Returns a value only when the `relay: true` option is on.

### addFieldOnObjectType

```
type AddFieldOnObjectTypeFn = (
  classIri: Iri,
  fieldName: string,
  graphqlFieldConfig: GraphQLFieldConfig
) => Iri
```

Adds a custom field on the GraphQLObjectType and GraphQLInterfaceType representing a class.
Throws if "classIri" is not found in the graph.
Returns a random IRI referencing the new virtual rdf:Property.

### extendFieldOnObjectType

```
type AddFieldOnObjectTypeFn = (
  classIri: Iri,
  propertyIri: Iri,
  graphqlFieldConfig: PseudoGraphQLFieldConfig
) => undefined
```

Similar to overriding a field using `_['http://foo.com/someProperty'].graphqlFieldConfigExtension = /* ... */` but only for a particular class, not for all of the classes on the property's domain.
A `PseudoGraphQLFieldConfig` is just a `GraphQLFieldConfig` where every key is optional. The other keys will be infered.
Throws if "classIri" is not found in the graph.

## Resolvers

Resolvers are functions needed to resolve data. You have to code them.

```
type Resolvers = {
  resolveSourceId: ResolveSourceIdFn,
  resolveSourceTypes: ResolveSourceTypesFn,
  resolveSourcePropertyValue: ResolveSourcePropertyValueFn,
  resolveResource: ResolveResourceFn,
  resolveResources: ResolveResourcesFn,
  resolveResourcesByPredicate: ResolveResourcesByPredicateFn,
}

type ResolverOutput<x> = x | Array<x> | Promise<x> | Promise<Array<x>>
```

### resolveSourceId

Given a source, resolve its id.

```
type ResolveSourceIdFn = (
  source?: any,
  context?: any,
  info?: GraphQLResolveInfo
) => ?ID | ?Promise<ID>
```

Must be sync if you use Relay.
See [`globalIdField`'s source code](https://github.com/graphql/graphql-relay-js/blob/master/src/node/node.js#L107)

### resolveSourceTypes

Given a source, resolve its rdf:type. Can be a single IRI since its super-classes will be infered.

```
type ResolveSourceTypesFn = (
  source?: any,
  info?: GraphQLResolveInfo
) => ResolverOutput<class: Iri>
```

### resolveSourcePropertyValue

Given a source and the IRI of a predicate, resolve the objects for that source and predicate.

```
type ResolveSourcePropertyValueFn = (
  source?: any,
  propertyIri?: Iri,
  context?: any,
  info?: GraphQLResolveInfo
) => ?ResolverOutput<any>
```

### resolveResource

Given the IRI of a resource, resolve a "source" for other resolvers to use. You can either return the resource IRI to pass around as source, or fetch all the predicates/objects for that subject and return an object.

```
type ResolveResourceFn = (
  resourceIri?: Iri,
  context?: any,
  info?: GraphQLResolveInfo
) => ?ResolverOutput<any>
```

### resolveResources

Same as `resolveResource` but with an array of IRIs.

```
type ResolveResourcesFn = (
  resourceIris?: Array<Iri>,
  context?: any,
  info?: GraphQLResolveInfo
) => ?ResolverOutput<any>
```

### resolveResourcesByPredicate

Given a array of possible rdf:type, a predicate and an object, resolve the subjects matching that pattern.

```
type ResolveResourcesByPredicateFn = (
  typeIris?: Array<Iri>,
  predicateIri?: Iri,
  value?: any,
  context?: any,
  info?: GraphQLResolveInfo
) => ?ResolverOutput<any>
```

## Overriding default values

To override anything there is no method: you directly set the library's internals.

```js
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
| class | relayConnectionDefinitions | { edgeType, connectionType } |
| property | isGraphqlList | Boolean |
| property | isRelayConnection | Boolean |
| property | graphqlFieldConfig | GraphQLFieldConfig |
| property | graphqlFieldConfigExtension | partial GraphQLFieldConfig, to modify only parts of it |
| property | shouldAlwaysUseInverseOf | Boolean |
| property | shouldNeverUseInverseOf | Boolean |

Note that the following overrides must be performed *before* invoking `getObjectType` or `getInterfaceType` or `getEdgeType` or `getConnectionType` since those methods create the GraphQL objects you want to override.

Examples:
```js
_['http://foo.com#worksForCompany'].graphqlName = 'company';
// Now the field name for foo:worksForCompany will be 'company'

// Partial modifications to fields are achieved using
_['http://foo.com#someOtherProperty'].graphqlFieldConfigExtension = {
  args: /* Look Ma', arguments! */
  resolve: customResolveFn,
};

// Completly overriding a GraphQLObject can be done with
_['http://foo.com/MyClass'].graphqlObjectType = new GraphQLObjectType({ /* ... */});
```

## Using Relay

By using the `relay: true` option:

- The `_.nodeField` and `_.nodeInterface` object are available
- The `_.getConnectionType` and `_.getEdgeType` methods are available
- All ObjectTypes exhibit the Node interface
- The id field is a globalIdField

See the [Relay example](examples/relay).

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

- Some items of the preceding list might be impossible to implement and end up here.

## Contributing

Yes, thank you. Please lint, update/write tests and add your name to the package.json file before you PR.

## License

Semantic GraphQL is released under the MIT License.

GraphQL is released by Facebook, inc. under the [BSD-license](https://github.com/graphql/graphql-js/blob/master/LICENSE)
with an additional
[patent grant](https://github.com/graphql/graphql-js/blob/master/PATENTS).

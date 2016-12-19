# To do

## High

- [ ] Add iri blacklist (userland?)
- [ ] drop n3 support (requires semantic-toolkit)
- [ ] support blank nodes
- [ ] consider restrictions as classes (for now)
- [ ] allow up and down option for inverseOf inference

## Low

- [ ] support restrictions
- [ ] Change SemanticGraph API to pass resolvers whenever
- [ ] isGraphqlList: infer desecendant of owl:FunctionalProperty
- [ ] promisify resolver at set time
- [ ] add recipes for resolvers
- [ ] refactor and dry up graphql folder
- [ ] improve objectResolver performance
- [ ] allow contracted iris on API
- [ ] try using interfaces instead of ObjectTypes on fields, to see
- [ ] support equivalences/sameAs
- [ ] use a "consider all classes disjoint" option
- [ ] error messages
- [ ] docs
- [ ] tests (test schema (string) generation, and inference execution)

## Done

- [x] place id field on top of the other fields for introspection queries to look nice
- [x] use GraphQLObjectTypeConfig.isTypeOf (with multiple class IRI) instead of GraphQLInterfaceTypeConfig.resolveType.
      it's optionnal on relay: https://github.com/graphql/graphql-relay-js/blob/373f2dab5fc6d4ac4cf6394aa94cbebd8cb64650/src/node/node.js
- [x] full promise support
- [x] individuals support
- [x] remove individuals support
- [x] extend field for a given class
- [x] ignore class or field globally: userland
- [x] delete field on an ObjectType: userland ?
- [x] mutate graph data: wont do

# TODO

- [ ] Change SemanticGraph API to pass resolvers whenever
- [ ] isGraphqlList: infer desecendant of owl:FunctionalProperty
- [ ] promisify resolver at set time
- [ ] add recipes for resolvers
- [ ] refactor and dry up graphql folder
- [ ] improve objectResolver performance
- [ ] drop n3 support
- [ ] allow contracted iris on API
- [ ] try using interfaces instead of ObjectTypes on fields, to see
- [ ] support blank nodes
- [ ] support equivalences/sameAs
- [ ] use a "consider all classes disjoint" option
- [ ] support restrictions
- [ ] consider restrictions as classes (for now)
- [ ] error messages
- [ ] docs
- [ ] tests

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

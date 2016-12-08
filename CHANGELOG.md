# Changelog

# 0.2.1

**Bug fixes:**
- Fixed a bug concerning the inference of owl:inverseOf

# 0.2.0

**Breaking changes:**
- Removed resolvers.resolveSourceClassIri
- Added resolvers.resolveSourceTypes
- Interface type resolving now happens on GraphQLObjectTypes. This means that your external GraphQLObjectTypes must provide an isTypeOf method.

**New features:**
- Promise support for all resolvers

**Bug fixes:**
- Fixed requireGraphqlRelay behavior
- Fixed a bug on SemanticGraph#addFieldOnObjectType
- Fixed a bug that happened when inferring owl:inverseOf on properties that are a rdfs:subProperty with no rdfs:range
- Fixed a circular dependency in ./src/graphql

**Miscellaneous:**
- Add MIT license
- Add .npmignore file
- id field now appears on top when introspecting
- graphqlDescription are now created from the locale in config

# 0.1.0

First release! :tada:

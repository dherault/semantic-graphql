# Changelog

# 0.5.1

**Bug fixes:**
- Bug on `owl:inverseOf` inference that broke the feature in some cases.

# 0.5.0

**Breaking changes:**
- `getIriLocalName` is not exposed/exported by the package anymore.

**New features:**
- On in-graph properties, new `shouldAlwaysUseInverseOf` and `shouldNeverUseInverseOf` config keys to modify the resolver's behavior.

**Bug fixes:**
- `isGraphqlList` is now also infered from `isGraphqlConnection`.
- `preventIdField` config option can now also prevent the Relay id field.

**Miscellaneous:**
- Tests! :tada: (very basic for now)
- Better docs

# 0.4.0

**Breaking changes:**
- `resolvers.resolveSourceTypes` must now be sync.
- Interface type resolving was rolled back on InterfaceTypes (instead of ObjectTypes). Better support, although still incomplete. External ObjectTypes must not provide an `isTypeOf` method anymore, instead external InterfaceTypes must provide a `resolveType` method.

**Bug fixes:**
- Fragile type resolution on interfaces. Will require further work.

**Miscellaneous:**
- Promisify using `Promise.resolve` instead of home-made function. It's slower but safer.

# 0.3.1

**Bug fixes:**
- Warn when traversing graph and encoutering missing vertices.

# 0.3.0

**Breaking changes:**
- Cannot override `relayEdgeType` and `relayConnectionType` anymore. `relayConnectionDefinitions` override added instead.

**Bug fixes:**
- Bug concerning the creation of Relay types.

# 0.2.1

**Bug fixes:**
- Fixed a bug concerning the inference of owl:inverseOf.

# 0.2.0

**Breaking changes:**
- Removed `resolvers.resolveSourceClassIri`.
- Added `resolvers.resolveSourceTypes`.
- Interface type resolving now happens on GraphQLObjectTypes. This means that your external GraphQLObjectTypes must provide an `isTypeOf` method.

**New features:**
- Promise support for all resolvers.

**Bug fixes:**
- Fixed `requireGraphqlRelay` behavior.
- Fixed a bug on `SemanticGraph#addFieldOnObjectType`.
- Fixed a bug that happened when inferring owl:inverseOf on properties that are a rdfs:subProperty with no rdfs:range.
- Fixed a circular dependency in ./src/graphql.

**Miscellaneous:**
- Add MIT license.
- Add .npmignore file.
- id field now appears on top when introspecting.
- graphqlDescription are now created from the locale in config.

# 0.1.0

First release! :tada:

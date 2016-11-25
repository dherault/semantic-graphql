let graphqlRelay;

// optionnalPeerDependencies still don't exist, so graphql-relay is a ghost dep
// let's find it
function requireGraphqlRelay() {
  if (graphqlRelay) return graphqlRelay;

  try {
    graphqlRelay = require('graphql-relay');
  }
  catch (ex) {
    // Nothing
  }

  if (!graphqlRelay) {
    // Go up until graphql-relay is found
    // Inspired by https://www.npmjs.com/package/parent-require
    for (let parent = module.parent; !graphqlRelay || parent; parent = parent.parent) {
      try {
        graphqlRelay = parent.require('graphql-relay');
      }
      catch (ex) {
        // Nothing
      }
    }

    // No pity
    if (!graphqlRelay) throw new Error('semantic-graphql was not able to find "graphql-relay" as a dependency of your project. Run "npm install graphql-relay" or set the "relay" option to false.');
  }

  return graphqlRelay;
}

module.exports = requireGraphqlRelay;

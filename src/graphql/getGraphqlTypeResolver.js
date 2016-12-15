const { _rdfsSubClassOf, rdfsResource } = require('../constants');
const isNil = require('../utils/isNil');
const castArrayShape = require('../utils/castArrayShape');
const { walkmap } = require('../graph/traversal');
const getGraphqlObjectType = require('./getGraphqlObjectType');

// TODO: kill that bird
function getGraphqlTypeResolver(g, iri) {

  // We look for all sub-classes of this rdfs:Class
  const classes = [...walkmap(g, iri, _rdfsSubClassOf)];
  const l = classes.length - 1;

  return (source, info) => {
    const types = g.resolvers.resolveSourceTypes(source, info);

    // Everything is a resource, hence the fallback
    if (isNil(types)) return getGraphqlObjectType(g, rdfsResource);

    const typesArray = castArrayShape(types);

    // From last to first to return the most restrictive class
    for (let i = l; i >= 0; i--) {
      const classIri = classes[i];

      if (typesArray.includes(classIri)) return getGraphqlObjectType(g, classIri);
    }

    // This is the case when iri === rdfsResource
    return getGraphqlObjectType(g, typesArray[0]);
  };
}

module.exports = getGraphqlTypeResolver;

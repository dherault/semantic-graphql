const data = require('./data');
const getIriLocalName = require('../../src/utils/getIriLocalName');

module.exports = {
  resolveSourceId(source) {
    return source.id;
  },
  resolveSourcePropertyValue(source, iri) {
    return source[getIriLocalName(iri)];
  },
  resolveSourceClassIri(source) {
    return `http://foo.com#${source.type}`;
  },
  resolveResource(id) {
    console.log('resolveId', id);

    return data.find(n => n.id === id);
  },
  resolveResources(ids) {
    console.log('resolveId', ids);

    return data.filter(n => ids.includes(n.id));
  },
  resolveResourcesByPredicate(types, iri, value) {
    const typesLocalNames = types.map(getIriLocalName);
    const localName = getIriLocalName(iri);

    console.log('resolvePredicate', typesLocalNames, localName, value);

    return data.filter(n => typesLocalNames.includes(n.type) && n[localName] === value);
  },
};

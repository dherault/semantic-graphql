const data = require('./data');
const getIriLocalName = require('../../src/utils/getIriLocalName');

module.exports = {
  resolveSourceId(source) {
    return source.id;
  },
  resolveSourcePropertyValue(source, iri) {
    return source[getIriLocalName(iri)]; // The correct shape (array or not) will be cast
  },
  resolveSourceTypes(source) {
    return `http://foo.com#${source.type}`; // Or an array of types
  },
  resolveResource(id) {
    console.log('resolveResource', id);

    return data.find(n => n.id === id);
  },
  resolveResources(ids) {
    console.log('resolveResources', ids);

    return data.filter(n => ids.includes(n.id));
  },
  resolveResourcesByPredicate(types, iri, value) {
    const typesLocalNames = types.map(getIriLocalName);
    const localName = getIriLocalName(iri);

    console.log('resolveResourcesByPredicate', typesLocalNames, localName, value);

    return data.filter(n => typesLocalNames.includes(n.type) && n[localName] === value);
  },
};

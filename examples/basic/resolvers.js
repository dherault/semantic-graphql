const data = require('./data');
const getIriLocalName = require('../../src/utils/getIriLocalName');

module.exports = {
  resolveSourceId(source) {
    console.log('resolveSourceId', source.id);

    return source.id;
  },
  resolveSourcePropertyValue(source, iri) {
    const localName = getIriLocalName(iri);
 
    console.log('resolveSourcePropertyValue', source.id, localName);

    return source[localName]; // The correct shape (array or not) will be cast
  },
  resolveSourceTypes(source) {
    console.log('resolveSourceTypes', source.id, source.type);

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

const data = require('./data');

module.exports = {
  resolveFieldValue(source, iri, localName) {
    console.log('resolveFieldValue', localName, source[localName]);

    return source[localName];
  },
  resolveId(id) {
    console.log('resolveId', id);

    return data.find(n => n.id === id);
  },
  resolveIds(ids) {
    console.log('resolveId', ids);

    return data.filter(n => ids.includes(n.id));
  },
};

/*
  A Map that accepts unordered arrays of strings as its keys.

  const myMap = new ArrayKeyedMap();
  myMap.set(['foo', 'bar'], 'somevalue');
  myMap.get(['bar', 'foo']); // 'somevalue'
*/

const sep = Math.random().toString();
const hash = array => array.sort().join(sep);
// const unhash = key => key.split(sep);

class ArrayKeyedMap extends Map {

  get(array) {
    return super.get(hash(array));
  }

  set(array, value) {
    return super.set(hash(array), value);
  }

  has(array) {
    return super.has(hash(array));
  }

  /*
  delete(array) {
    return super.delete(hash(array));
  }

  forEach(cb, thisArg) {
    return super.forEach((value, key, that) => cb(value, unhash(key), that), thisArg);
  }

  map(cb, thisArg) {
    return super.map((value, key, that) => cb(value, unhash(key), that), thisArg);
  }
  */
}

module.exports = ArrayKeyedMap;

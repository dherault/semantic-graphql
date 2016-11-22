function isPlainObject(obj) {
  return typeof obj === 'object' && obj !== null && Object.getPrototypeOf(obj) === Object.prototype;
}

module.exports = isPlainObject;

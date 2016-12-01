function isNil(value) {
  return typeof value === 'undefined' || value === null || (Array.isArray(value) && !value.length);
}

module.exports = isNil;

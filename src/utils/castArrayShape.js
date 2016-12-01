function castArrayShape(shouldBeArray, value) {
  const isArray = Array.isArray(value);

  return shouldBeArray ?
    isArray ? value : [value] :
    isArray ? value[0] : value;
}

module.exports = castArrayShape;

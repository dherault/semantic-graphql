// An id must be a string or a valid number
// NOTE: float numbers don't work as input for input fields with GraphlQLID type
// NOTE: Somehow, we accept the empty string as a valid id (it is after all a unique string)
function isValidId(id) {
  return typeof id === 'string' || typeof id === 'number' && id === id;
}

module.exports = isValidId;

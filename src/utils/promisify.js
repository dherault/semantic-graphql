// Could wrap into Promise.resolve but wonder about perfomance
// https://github.com/v8/v8/blob/master/src/js/promise.js
function promisify(value) {
  return value && typeof value.then === 'function' ? value : { then: fn => fn(value) }; // Bite me
}

module.exports = promisify;

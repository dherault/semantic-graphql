// Inspired by Facebook's invariant
// https://github.com/facebook/react/blob/v0.13.3/src/vendor/core/invariant.js
function invariant(condition, message) {
  if (!condition) {
    const error = new Error(message);

    error.name = 'Invariant Violation';
    Error.captureStackTrace(error, invariant); // Remove this function's frame from the stack

    throw error;
  }
}

module.exports = invariant;

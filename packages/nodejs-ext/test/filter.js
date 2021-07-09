"use strict"

const testExtensionFailure =
  process.env._TEST_APPSIGNAL_EXTENSION_FAILURE === "true"
// This function is run by using the --filter option for Jest. It will filter
// out tests that should not be run in certain situations, like testing the
// scenario when the extension failed.
module.exports = function (tests) {
  return {
    filtered: tests
      .filter(t => {
        const match = t.indexOf(".failure")
        if (testExtensionFailure) {
          // Select tests with `.failure` in the path if we're testing the
          // failure state.
          return match > -1
        } else {
          // Skip the tests with `.failure` in the path if we're testing the
          // success state.
          return match == -1
        }
      })
      .map(test => ({ test }))
  }
}

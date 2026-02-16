"use strict"

const testExtensionFailure =
  process.env._TEST_APPSIGNAL_EXTENSION_FAILURE === "true"
// This function is run by using the --filter option for Jest. It will filter
// out tests that should not be run in certain situations, like testing the
// scenario when the extension failed.
module.exports = testPaths => {
  return {
    filtered: testPaths.filter(path => {
      const isFailureTest =
        path.endsWith(".failure.test.js") || path.endsWith(".failure.test.ts")

      if (testExtensionFailure) {
        return isFailureTest
      }

      return !isFailureTest
    })
  }
}

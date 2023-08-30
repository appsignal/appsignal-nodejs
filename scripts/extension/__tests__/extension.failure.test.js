const fs = require("fs")
const { reportPath } = require("../support/helpers")

function hasExtensionFailure() {
  if (process.env._TEST_APPSIGNAL_EXTENSION_FAILURE !== "true") {
    console.log(
      `Skipping failure tests, because _TEST_APPSIGNAL_EXTENSION_FAILURE is not set to "true".`
    )
    return true
  }
}

describe("Extension install failure", () => {
  test("writes error result to diagnose installation report", () => {
    if (hasExtensionFailure()) {
      return
    }

    const report = readReport()
    expect(report["result"]).toMatchObject({
      status: "error",
      error: "AppSignal internal test failure",
      backtrace: expect.any(Array)
    })
  })
})

function readReport() {
  const contents = fs.readFileSync(reportPath(), "utf-8")
  return JSON.parse(contents)
}

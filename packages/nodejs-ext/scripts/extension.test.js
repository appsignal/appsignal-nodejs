const fs = require("fs")
const path = require("path")

describe("Extension install failure", () => {
  test("writes success result to diagnose installation report", () => {
    const report = readReport()
    expect(report["result"]).toEqual({
      status: "success"
    })
  })
})

function readReport() {
  const contents = fs.readFileSync(
    path.resolve("/tmp/appsignal-install-report.json"),
    "utf-8"
  )
  return JSON.parse(contents)
}

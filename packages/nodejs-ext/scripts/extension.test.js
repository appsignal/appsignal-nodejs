const fs = require("fs")
const path = require("path")
const { reportPath } = require("./report")

describe("Extension install failure", () => {
  test("writes success result to diagnose installation report", () => {
    const report = readReport()
    expect(report["result"]).toEqual({
      status: "success"
    })
  })
})

function readReport() {
  const contents = fs.readFileSync(reportPath(), "utf-8")
  return JSON.parse(contents)
}

// Checks how a project that depends on this package resolves its OpenTelemetry
// packages.
//
// The resolution that matters is the one a customer gets, and that is not the
// one in our own `node_modules`: `npm link` and our `package-lock.json` both
// change the answer. So this packs the package and installs it into a throwaway
// project with a throwaway npm cache. The empty cache matters too, because a
// populated one can serve a resolution that a fresh install would not pick.
//
// What counts as a problem, and which duplicates are allowed, lives in
// `check_otel_duplicates.js` and `otel_duplicates_allowed.json`.

"use strict"

const { execFileSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")

const { check } = require("./check_otel_duplicates")

const repoRoot = path.resolve(__dirname, "..")

function run(command, args, options) {
  return execFileSync(command, args, { encoding: "utf8", ...options })
}

const work = fs.mkdtempSync(path.join(os.tmpdir(), "otel-resolution-"))
const cache = fs.mkdtempSync(path.join(os.tmpdir(), "otel-resolution-cache-"))

// A full OpenTelemetry tree and its cache are not small, and this runs on every
// push, so leaving them behind adds up on a machine that is not a fresh runner.
function cleanUp() {
  for (const directory of [work, cache]) {
    fs.rmSync(directory, { recursive: true, force: true })
  }
}

process.on("exit", cleanUp)

// Node does not emit `exit` when it is signalled, and a cancelled CI job or an
// interrupted local run are the times the directories are largest.
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    cleanUp()
    process.exit(1)
  })
}

console.log("Packing the integration")
const packed = run("npm", ["pack", "--pack-destination", work], {
  cwd: repoRoot
})
const tarball = packed.trim().split("\n").pop()

fs.writeFileSync(
  path.join(work, "package.json"),
  JSON.stringify(
    {
      name: "otel-resolution-probe",
      version: "1.0.0",
      private: true,
      dependencies: { "@appsignal/nodejs": `file:${path.join(work, tarball)}` }
    },
    null,
    2
  )
)

console.log("Installing it into a throwaway project with an empty npm cache")
run(
  "npm",
  ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--cache", cache],
  { cwd: work, stdio: "inherit" }
)

console.log()

// Setting the code rather than calling `process.exit` lets Node drain stdout
// first. Everything this script is for is in that output, and a pipe, which is
// what CI gives it, is where a hard exit truncates.
try {
  process.exitCode = check(work) ? 0 : 1
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}

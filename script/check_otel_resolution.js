// Checks that a project depending on this package resolves exactly one copy of
// `@opentelemetry/api`.
//
// More than one copy is not a warning, it is a silent failure. The OpenTelemetry
// API stores its global tracer provider on `globalThis`, keyed by major version,
// and a copy of the API only reads that global when its own minor version is
// less than or equal to the minor version that wrote it. So when the integration
// registers the provider from an older copy than the one an instrumentation
// reads from, that instrumentation is handed a tracer that does nothing and
// drops every span it creates. Nothing is logged when this happens, which is why
// it needs a check rather than a test.
//
// The check installs into a throwaway project with a throwaway npm cache. A warm
// cache can hide a resolution that a customer installing from scratch would get,
// and the resolution that matters is the one a customer gets, not the one our own
// `package-lock.json` pins.
//
// Copies of other OpenTelemetry packages are reported but do not fail the check.
// Two copies of those are wasteful rather than broken, because the API package is
// the only one that shares state between copies through a version-checked global.

"use strict"

const { execFileSync } = require("child_process")
const fs = require("fs")
const os = require("os")
const path = require("path")

const repoRoot = path.resolve(__dirname, "..")

function run(command, args, options) {
  return execFileSync(command, args, { encoding: "utf8", ...options })
}

// Walks the installed tree rather than reading `package-lock.json`, so that what
// is reported is what Node would actually resolve at runtime.
function findPackages(root) {
  const found = new Map()

  function walk(dir) {
    let entries
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }

    for (const entry of entries) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue

      const full = path.join(dir, entry.name)
      const manifest = path.join(full, "package.json")

      if (fs.existsSync(manifest)) {
        let parsed
        try {
          parsed = JSON.parse(fs.readFileSync(manifest, "utf8"))
        } catch {
          parsed = null
        }

        if (parsed && parsed.name && parsed.version) {
          if (!found.has(parsed.name)) found.set(parsed.name, [])
          found.get(parsed.name).push({
            version: parsed.version,
            path: path.relative(root, full)
          })
        }
      }

      if (entry.name === "node_modules" || entry.name.startsWith("@")) {
        walk(full)
      } else {
        const nested = path.join(full, "node_modules")
        if (fs.existsSync(nested)) walk(nested)
      }
    }
  }

  walk(path.join(root, "node_modules"))
  return found
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

const packages = findPackages(work)

const apiCopies = packages.get("@opentelemetry/api") || []
console.log(`\n@opentelemetry/api copies: ${apiCopies.length}`)
for (const copy of apiCopies) console.log(`  ${copy.version}  ${copy.path}`)

console.log("\nOther OpenTelemetry packages resolved to more than one version:")
let duplicates = 0
for (const [name, copies] of [...packages.entries()].sort()) {
  if (name === "@opentelemetry/api") continue
  if (!name.startsWith("@opentelemetry/")) continue

  const versions = [...new Set(copies.map(copy => copy.version))].sort()
  if (versions.length < 2) continue

  duplicates += 1
  console.log(`  ${name} ${versions.join(", ")}`)
}
if (duplicates === 0) console.log("  none")

if (apiCopies.length !== 1) {
  console.error(
    `\nExpected exactly one copy of @opentelemetry/api, found ${apiCopies.length}.`
  )
  console.error(
    "Adjust the version bounds in package.json until npm resolves a single " +
      "copy. Widening the @opentelemetry/api bound usually helps more than " +
      "narrowing it, because every OpenTelemetry package depends on the API as " +
      "a peer dependency, and a wider bound is what lets npm share one copy " +
      "with the application."
  )
  process.exit(1)
}

console.log("\nOK")

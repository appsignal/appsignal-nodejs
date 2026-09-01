// Finds the OpenTelemetry packages installed in a project and reports which of
// them resolve to more than one version.
//
// Two copies of the same OpenTelemetry package are usually wasteful rather than
// broken, but two copies of `@opentelemetry/api` are a silent failure. The API
// keeps its global tracer provider on `globalThis`, keyed by major version, and
// a copy only reads that global when its own minor version is less than or equal
// to the minor version that wrote it. The copy that loses that comparison is
// handed a tracer that discards every span it is given, and nothing is logged.

"use strict"

const fs = require("fs")
const path = require("path")

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

// Sorts a version before another when it is older. Plain string order puts
// 1.10.0 before 1.9.0, and 0.221.0 before 0.56.0, which reads as nonsense in a
// report about which version came from where.
function compareVersions(left, right) {
  const parts = version => version.split(".").map(Number)
  const a = parts(left)
  const b = parts(right)

  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const difference = (a[i] || 0) - (b[i] || 0)
    if (difference !== 0) return difference
  }

  return 0
}

// npm nests a copy of a package inside whichever dependency asked for a version
// the hoisted copy cannot satisfy. So the directory a copy is nested in names
// the dependency responsible for it, and no version range has to be matched to
// work that out.
//
// Returns null for a copy at the top of `node_modules`, which is the one every
// other copy is a duplicate of.
function causeOf(copyPath) {
  const segments = copyPath.split(`node_modules${path.sep}`)
  if (segments.length < 3) return null

  return segments[segments.length - 2].replace(new RegExp(`\\${path.sep}$`), "")
}

// A package counts as duplicated when it resolves to more than one version.
// Copies of the same version in different places cost disk space but behave
// identically, so they are not reported.
//
// The hoisted copy is the one everything resolves by default, so it is the
// baseline: the versions worth reporting are the ones nested somewhere else, and
// what is worth naming is the dependency each of those is nested in.
function findDuplicates(packages) {
  const duplicates = []

  for (const [name, copies] of [...packages.entries()].sort()) {
    if (!name.startsWith("@opentelemetry/")) continue

    const versions = [...new Set(copies.map(copy => copy.version))].sort(
      compareVersions
    )
    if (versions.length < 2) continue

    const hoisted = copies.find(copy => causeOf(copy.path) === null)
    const baseline = hoisted ? hoisted.version : null

    const nested = new Map()
    for (const copy of copies) {
      if (copy.version === baseline) continue

      const cause = causeOf(copy.path)
      if (!cause) continue

      if (!nested.has(copy.version)) nested.set(copy.version, new Set())
      nested.get(copy.version).add(cause)
    }

    duplicates.push({
      name,
      versions,
      baseline,
      nested: [...nested.entries()]
        .map(([version, causes]) => ({ version, causes: [...causes].sort() }))
        .sort((a, b) => compareVersions(a.version, b.version))
    })
  }

  return duplicates
}

module.exports = { findPackages, findDuplicates, causeOf, compareVersions }

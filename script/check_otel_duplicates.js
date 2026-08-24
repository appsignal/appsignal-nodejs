// Checks the OpenTelemetry packages installed in a project.
//
// Usage: check_otel_duplicates.js [project directory] [--api-only]
//
// Fails when the project resolves `@opentelemetry/api` at more than one major
// and minor version, or more than one version of any other OpenTelemetry
// package that `otel_duplicates_allowed.json` does not account for. Allowlist
// entries that no longer match anything are reported too, so the file does not
// accumulate reasons that have stopped being true.
//
// `--api-only` restricts the check to `@opentelemetry/api`, which is what the
// test apps use: they link the integration rather than installing it, so their
// tree is not a customer's, and only the API duplicate means anything there.
//
// This runs in our own CI and in our own test apps. It is deliberately not an
// install hook in the published package: npm rolls back the whole install when
// a lifecycle script fails, so a check that failed here would leave an
// application with no dependencies at all.

"use strict"

const fs = require("fs")
const path = require("path")

const { findPackages, findDuplicates } = require("./otel_packages")

const ALLOWED_PATH = path.join(__dirname, "otel_duplicates_allowed.json")
const ALLOWED_NAME = path.basename(ALLOWED_PATH)

// Carrying on without the allowlist would report every duplicate as one nobody
// has accounted for, and tell whoever is reading to add entries to a file that
// already has them.
function readAllowlist() {
  let parsed

  try {
    parsed = JSON.parse(fs.readFileSync(ALLOWED_PATH, "utf8"))
  } catch (error) {
    throw new Error(`Could not read ${ALLOWED_PATH}: ${error.message}`)
  }

  // Without this the shape only shows up later, as a TypeError that does not
  // mention the file.
  if (!Array.isArray(parsed)) {
    throw new Error(`${ALLOWED_PATH} must contain an array of entries.`)
  }

  return parsed
}

// `quiet` suppresses the inventory and the allowlist maintenance warnings, so
// that an install that resolved everything correctly prints nothing.
function check(root, { quiet = false, apiOnly = false } = {}) {
  const packages = findPackages(root)
  // Only the full check consults the allowlist, so an unreadable file cannot
  // print anything during someone else's install.
  const allowlist = apiOnly ? [] : readAllowlist()

  const problems = []
  const matched = new Set()
  const log = quiet ? () => {} : console.log

  const apiCopies = packages.get("@opentelemetry/api") || []
  // The API decides whether one copy can read another's global by major and
  // minor version only, so copies that differ just in their patch version are
  // interchangeable.
  const apiVersions = [
    ...new Set(
      apiCopies.map(copy => copy.version.split(".").slice(0, 2).join("."))
    )
  ]
  // The number of copies alone reads as a problem, and it is not one on its
  // own: what decides that is how many versions those copies span.
  const copies =
    apiCopies.length === 1 ? "1 copy" : `${apiCopies.length} copies`
  const versions =
    apiVersions.length === 1 ? "1 version" : `${apiVersions.length} versions`
  log(`@opentelemetry/api: ${copies}, ${versions}`)
  for (const copy of apiCopies) log(`  ${copy.version}  ${copy.path}`)

  // Copies of the same version are harmless, because the global the API keeps
  // its tracer provider on is read whenever the versions are compatible, and a
  // version is always compatible with itself. `npm link` produces such copies
  // routinely, so counting copies rather than versions would report a problem
  // every time.
  // Nothing to compare means nothing is installed, and a project that cannot
  // find the API at all reports no spans either.
  if (apiCopies.length === 0) {
    problems.push(
      "No @opentelemetry/api is installed. Nothing here can report a span."
    )
  }

  if (apiVersions.length > 1) {
    // Never allowlisted. Every other duplicate wastes space; this one stops
    // spans from being reported at all.
    problems.push(
      "More than one version of @opentelemetry/api is installed:\n" +
        apiCopies.map(copy => `    ${copy.version}  ${copy.path}`).join("\n") +
        "\n  A project resolving this tree has spans dropped with no error.\n" +
        "  Adjust the `@opentelemetry/api` bound until npm resolves a single\n" +
        "  copy. The versions above are what it resolved instead."
    )
  }

  const duplicates = apiOnly
    ? []
    : findDuplicates(packages).filter(
        duplicate => duplicate.name !== "@opentelemetry/api"
      )

  if (!apiOnly) {
    log("\nOpenTelemetry packages resolved to more than one version:")
    if (duplicates.length === 0) log("  none")
  }

  for (const duplicate of duplicates) {
    log(`  ${duplicate.name} ${duplicate.versions.join(", ")}`)

    for (const { version, causes } of duplicate.nested) {
      const unexplained = causes.filter(cause => {
        const entry = allowlist.find(
          allowed =>
            allowed.package === duplicate.name && allowed.cause === cause
        )
        if (entry) matched.add(entry)
        return !entry
      })

      const status = unexplained.length === 0 ? "allowed" : "NOT ALLOWED"
      log(`    ${version} nested in ${causes.join(", ")} (${status})`)

      if (unexplained.length > 0) {
        problems.push(
          `${duplicate.name} resolves to ${version} inside ` +
            `${unexplained.join(", ")}, and to ` +
            `${duplicate.baseline || "another version"} elsewhere.\n` +
            "  Move the version bounds until both agree, or add an entry to " +
            `${ALLOWED_NAME} explaining why they cannot.`
        )
      }
    }
  }

  if (!quiet && !apiOnly) {
    for (const entry of allowlist) {
      if (matched.has(entry)) continue

      console.warn(
        `\nWarning: ${entry.package} no longer resolves to a separate ` +
          `version inside ${entry.cause}.\n  Remove that entry from ` +
          `${ALLOWED_NAME}.`
      )
    }
  }

  if (problems.length === 0) {
    log("\nOK")
    return true
  }

  for (const problem of problems) console.error(`\n${problem}`)

  return false
}

if (require.main === module) {
  const args = process.argv.slice(2)
  const apiOnly = args.includes("--api-only")
  const root = args.find(arg => !arg.startsWith("--")) || process.cwd()

  try {
    process.exitCode = check(root, { apiOnly }) ? 0 : 1
  } catch (error) {
    // A stack trace says nothing here that the message does not.
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { check }

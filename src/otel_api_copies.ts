import fs from "fs"
import path from "path"

/**
 * Finds the copies of `@opentelemetry/api` this process has loaded.
 *
 * Two copies in one project stop spans from being reported, and say nothing
 * about it. The API keeps its tracer provider on a global keyed by major
 * version, and a copy only reads that global when its own minor version is no
 * higher than the minor version that wrote it. Whichever copy loses that
 * comparison is handed a tracer that discards every span it is given.
 *
 * The loaded copies are what matters, rather than the copies on disk. A second
 * copy that nothing requires does no harm, and walking `node_modules` to find
 * it would cost more than reading a cache that is already in memory.
 */
export type OpenTelemetryApiCopy = { version: string; path: string }

export function loadedOpenTelemetryApiCopies(
  loadedFiles = Object.keys(require.cache)
): OpenTelemetryApiCopy[] {
  const marker = path.join("@opentelemetry", "api") + path.sep
  const roots = new Set<string>()

  for (const filename of loadedFiles) {
    const at = filename.lastIndexOf(marker)
    if (at === -1) continue

    roots.add(filename.slice(0, at + marker.length - 1))
  }

  const copies: OpenTelemetryApiCopy[] = []

  for (const root of roots) {
    try {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(root, "package.json"), "utf8")
      )

      if (manifest.name === "@opentelemetry/api" && manifest.version) {
        copies.push({ version: manifest.version, path: root })
      }
    } catch {
      // A directory that looks like the package but has no readable manifest
      // tells us nothing, so there is nothing to report about it.
    }
  }

  return copies
}

/**
 * Describes the problem when more than one incompatible copy of
 * `@opentelemetry/api` is loaded, or returns `undefined` when the copies can
 * all talk to each other.
 *
 * Copies differing only in their patch version are left alone. The API compares
 * major and minor versions when it decides whether one copy may read another's
 * global, so those copies are interchangeable, and `npm link` produces them
 * routinely.
 */
export function duplicateOpenTelemetryApiWarning(
  copies: OpenTelemetryApiCopy[] = loadedOpenTelemetryApiCopies()
): string | undefined {
  const seen = new Set(
    copies.map(copy => copy.version.split(".").slice(0, 2).join("."))
  )

  if (seen.size < 2) return undefined

  const listed = copies
    .map(copy => `  ${copy.version} in ${copy.path}`)
    .sort()
    .join("\n")

  return (
    "More than one version of @opentelemetry/api is loaded, so some spans " +
    "will not be reported and nothing else will say so:\n" +
    `${listed}\n` +
    "Make your application and its dependencies agree on one version of " +
    "@opentelemetry/api. If a dependency asks for a version that cannot be " +
    "shared, updating it may be enough, and your package manager can force a " +
    "single version if it is not."
  )
}

let hasWarned = false

/**
 * The same as `duplicateOpenTelemetryApiWarning`, but only the first time it
 * has something to say.
 *
 * A second `Client` would otherwise repeat a warning about the same tree. The
 * module cache can still gain a copy later, so this stays quiet only once it
 * has something to say: a first look that found nothing does not silence it.
 */
export function duplicateOpenTelemetryApiWarningOnce(
  copies?: OpenTelemetryApiCopy[]
): string | undefined {
  if (hasWarned) return undefined

  const warning = duplicateOpenTelemetryApiWarning(copies)
  if (warning) hasWarned = true

  return warning
}

/** @internal */
export function resetDuplicateOpenTelemetryApiWarning() {
  hasWarned = false
}

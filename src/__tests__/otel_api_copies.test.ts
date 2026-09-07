import fs from "fs"
import os from "os"
import path from "path"

import {
  duplicateOpenTelemetryApiWarning,
  duplicateOpenTelemetryApiWarningOnce,
  loadedOpenTelemetryApiCopies,
  resetDuplicateOpenTelemetryApiWarning
} from "../otel_api_copies"

describe("duplicateOpenTelemetryApiWarning", () => {
  it("says nothing when only one copy is loaded", () => {
    expect(
      duplicateOpenTelemetryApiWarning([
        { version: "1.9.1", path: "/app/node_modules/@opentelemetry/api" }
      ])
    ).toBeUndefined()
  })

  it("says nothing when no copy is loaded", () => {
    expect(duplicateOpenTelemetryApiWarning([])).toBeUndefined()
  })

  it("says nothing when the copies differ only in their patch version", () => {
    expect(
      duplicateOpenTelemetryApiWarning([
        { version: "1.9.0", path: "/app/node_modules/@opentelemetry/api" },
        {
          version: "1.9.1",
          path: "/app/node_modules/other/node_modules/@opentelemetry/api"
        }
      ])
    ).toBeUndefined()
  })

  it("warns when the copies differ in their minor version", () => {
    const warning = duplicateOpenTelemetryApiWarning([
      { version: "1.7.0", path: "/app/node_modules/@opentelemetry/api" },
      {
        version: "1.9.1",
        path: "/app/node_modules/other/node_modules/@opentelemetry/api"
      }
    ])

    expect(warning).toContain("More than one version of @opentelemetry/api")
    expect(warning).toContain("1.7.0 in /app/node_modules/@opentelemetry/api")
    expect(warning).toContain(
      "1.9.1 in /app/node_modules/other/node_modules/@opentelemetry/api"
    )
  })

  it("warns when the copies differ in their major version", () => {
    expect(
      duplicateOpenTelemetryApiWarning([
        { version: "1.9.1", path: "/app/node_modules/@opentelemetry/api" },
        {
          version: "2.0.0",
          path: "/app/node_modules/other/node_modules/@opentelemetry/api"
        }
      ])
    ).toContain("More than one version of @opentelemetry/api")
  })
})

describe("loadedOpenTelemetryApiCopies", () => {
  let directory: string
  let loaded: string[]

  beforeEach(() => {
    directory = fs.mkdtempSync(path.join(os.tmpdir(), "otel-api-copies-"))
    loaded = []
  })

  afterEach(() => {
    fs.rmSync(directory, { recursive: true, force: true })
  })

  function fakeCopy(nestedIn: string | undefined, version: string) {
    const root = path.join(
      directory,
      ...(nestedIn ? [nestedIn, "node_modules"] : []),
      "@opentelemetry",
      "api"
    )

    fs.mkdirSync(path.join(root, "build", "src"), { recursive: true })
    fs.writeFileSync(
      path.join(root, "package.json"),
      JSON.stringify({ name: "@opentelemetry/api", version })
    )

    // The cache is keyed by the files a copy loaded, not by its directory, so
    // the entry has to look like one of them.
    const entry = path.join(root, "build", "src", "index.js")
    fs.writeFileSync(entry, "")
    loaded.push(entry)

    return root
  }

  it("finds each loaded copy, with its version", () => {
    const first = fakeCopy(undefined, "1.7.0")
    const second = fakeCopy("some-library", "1.9.1")

    const found = loadedOpenTelemetryApiCopies(loaded)

    expect(found).toHaveLength(2)
    expect(found).toContainEqual({ version: "1.7.0", path: first })
    expect(found).toContainEqual({ version: "1.9.1", path: second })
  })

  it("reports one copy once, however many of its files are loaded", () => {
    const root = fakeCopy(undefined, "1.9.1")
    for (const name of ["trace.js", "context.js"]) {
      const entry = path.join(root, "build", "src", name)
      fs.writeFileSync(entry, "")
      loaded.push(entry)
    }

    const found = loadedOpenTelemetryApiCopies(loaded)

    expect(found).toEqual([{ version: "1.9.1", path: root }])
  })
})

describe("duplicateOpenTelemetryApiWarningOnce", () => {
  const incompatible = [
    { version: "1.7.0", path: "/app/node_modules/@opentelemetry/api" },
    {
      version: "1.9.1",
      path: "/app/node_modules/other/node_modules/@opentelemetry/api"
    }
  ]

  beforeEach(() => {
    resetDuplicateOpenTelemetryApiWarning()
  })

  it("warns the first time and stays quiet after that", () => {
    expect(duplicateOpenTelemetryApiWarningOnce(incompatible)).toContain(
      "More than one version of @opentelemetry/api"
    )
    expect(duplicateOpenTelemetryApiWarningOnce(incompatible)).toBeUndefined()
  })

  it("still warns later when the first look found nothing to say", () => {
    const fine = [
      { version: "1.9.1", path: "/app/node_modules/@opentelemetry/api" }
    ]

    expect(duplicateOpenTelemetryApiWarningOnce(fine)).toBeUndefined()
    expect(duplicateOpenTelemetryApiWarningOnce(incompatible)).toContain(
      "More than one version of @opentelemetry/api"
    )
  })
})

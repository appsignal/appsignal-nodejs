#!/usr/bin/env node

const path = require("path")
const https = require("https")
const fs = require("fs")
const crypto = require("crypto")
const childProcess = require("child_process")

const { TRIPLES } = require("./extension/constants")

const {
  hasLocalBuild,
  hasSupportedArchitecture,
  hasSupportedOs
} = require("./extension/helpers")

const {
  createReport,
  createBuildReport,
  createDownloadReport
} = require("./report")

const EXT_PATH = path.join(__dirname, "/../ext/")

function download(url, outputPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(outputPath)

    https.get(url, response => {
      const { statusCode } = response

      if (statusCode >= 400) {
        return reject(
          new Error(`Request to CDN failed with code HTTP ${statusCode}`)
        )
      }

      response.pipe(file).on("finish", () => resolve(outputPath))
    })
  })
}

function extract(filepath) {
  return new Promise((resolve, reject) => {
    childProcess.exec(`tar -C ext/ -xzf "${filepath}"`, err => {
      return !err ? resolve() : reject(err)
    })
  })
}

function verify(filepath, checksum) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(crypto.createHash("SHA256").setEncoding("hex"))
      .on("finish", function () {
        this.end()

        if (this.read() === checksum) {
          return resolve()
        } else {
          return reject(new Error("Checksum verification failed"))
        }
      })
  })
}

function dumpReport(report) {
  return new Promise(resolve => {
    fs.writeFile(
      "/tmp/appsignal-install-report.json",
      JSON.stringify(report, null, 2),
      () => {
        return resolve()
      }
    )
  })
}

function mapArchitecture(architecture) {
  switch (architecture) {
    case "x64":
      return "x86_64"
      break
    case "x86":
      return "i686"
      break
    case "arm64":
      return "aarch64"
      break
  }

  console.error(
    `AppSignal currently does not know about your system architecture
    (${architecture}). Please let us know at support@appsignal.com, we aim to
    support everything our customers run.`
  )

  return process.exit(1)
}

function getMetadataForTarget({ architecture, target }) {
  const triple = [mapArchitecture(architecture), `-${target}`]

  return TRIPLES[triple.join("")]
}

// Script logic begins here
;(function () {
  if (hasLocalBuild()) {
    // check for a local build (dev only)
    console.warn(`Using local build for agent. Skipping download.`)
    return process.exit(0)
  }

  if (!hasSupportedArchitecture(process.arch)) {
    console.error(
      `AppSignal currently does not support your system architecture 
        (${process.platform} ${process.arch}). Please let us know at 
        support@appsignal.com, we aim to support everything our customers run.`
    )

    return process.exit(1)
  }

  if (!hasSupportedOs(process.platform)) {
    console.error(
      `AppSignal currently does not support your operating system (${process.platform}). 
      Please let us know at support@appsignal.com, we aim to support everything 
      our customers run.`
    )

    return process.exit(1)
  }

  const report = createReport()
  report.build = createBuildReport({})

  // try and get one from the CDN
  const metadata = getMetadataForTarget(report.build)
  const filename = metadata.downloadUrl.split("/")[4]
  const outputPath = path.join(EXT_PATH, filename)

  return download(metadata.downloadUrl, outputPath)
    .then(filepath =>
      verify(filepath, metadata.checksum).then(() => extract(filepath))
    )
    .then(() => {
      // once extracted, we can then hand off to node-gyp for building
      // @TODO: add cleanup step
      console.log("The agent has downloaded successfully! Building...")

      report.download = createDownloadReport({
        verified: true,
        downloadUrl: metadata.downloadUrl
      })

      report.result.status = "unknown"

      return dumpReport(report).then(() => {
        process.exit(0)
      })
    })
    .catch(error => {
      console.error(error)

      report.download = createDownloadReport({
        verified: false,
        downloadUrl: metadata.downloadUrl
      })

      return dumpReport(report).then(() => {
        process.exit(1)
      })
    })
})()

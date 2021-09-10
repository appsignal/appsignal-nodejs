#!/usr/bin/env node

const path = require("path")
const https = require("https")
const fs = require("fs")
const crypto = require("crypto")
const childProcess = require("child_process")

const { AGENT_VERSION, MIRRORS, TRIPLES } = require("./extension/constants")

const {
  hasLocalBuild,
  hasSupportedArchitecture,
  hasSupportedOs
} = require("./extension/helpers")

const {
  createReport,
  createBuildReport,
  createDownloadReport,
  reportPath
} = require("./report")

const EXT_PATH = path.join(__dirname, "/../ext/")
const testExtensionFailure =
  process.env._TEST_APPSIGNAL_EXTENSION_FAILURE === "true"

class DownloadError extends Error {
  constructor(message, downloadUrl) {
    super(message)
    this.name = this.constructor.name
    this.downloadUrl = downloadUrl
  }
}

function downloadFromMirror(mirror, filename, outputPath) {
  return new Promise((resolve, reject) => {
    const url = path.join(mirror, AGENT_VERSION, filename)
    const file = fs.createWriteStream(outputPath)

    https.get(url, response => {
      const { statusCode } = response

      if (statusCode >= 400) {
        return reject(
          new DownloadError(
            `Request to CDN failed with code HTTP ${statusCode}`,
            url
          )
        )
      } else {
        response.pipe(file).on("finish", () => resolve(url))
      }
    })
  })
}

function download(mirrors, filename, outputPath) {
  return new Promise((resolve, reject) => {
    if (testExtensionFailure) {
      throw new DownloadError("AppSignal internal test failure", undefined)
    }

    if (mirrors.length === 0) {
      reject(
        new DownloadError("Could not download agent from any mirror", undefined)
      )
      return
    }

    downloadFromMirror(mirrors.shift(), filename, outputPath)
      .then(url => resolve(url))
      .catch(error => {
        console.error("Error downloading from mirror:", error)
        download(mirrors, filename, outputPath)
          .then(url => resolve(url))
          .catch(error => reject(error))
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
    fs.writeFile(reportPath(), JSON.stringify(report, null, 2), () => {
      return resolve()
    })
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

function install() {
  return new Promise((resolve, reject) => {
    childProcess.exec("node-gyp rebuild", error => {
      if (error) {
        return reject(error)
      } else {
        return resolve()
      }
    })
  })
}

// Script logic begins here
;(function () {
  if (hasLocalBuild() && !testExtensionFailure) {
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
  const filename = metadata.filename
  const outputPath = path.join(EXT_PATH, filename)

  report.build.source = "remote"

  return download(MIRRORS, filename, outputPath)
    .then(url => {
      report.download.download_url = url

      verify(outputPath, metadata.checksum).then(() => {
        report.download.checksum = "verified"

        return extract(outputPath)
      })
    })
    .then(() => {
      // @TODO: add cleanup step
      console.log("The agent has downloaded successfully! Building...")

      report.result.status = "unknown"
      return install().then(() => {
        report.result.status = "success"
      })
    })
    .then(() => {
      return dumpReport(report).then(() => {
        process.exit(0)
      })
    })
    .catch(error => {
      console.error(error)

      report.result = {
        status: "error",
        error: error.message,
        backtrace: error.stack.split("\n")
      }

      if (error.downloadUrl) {
        report.download.download_url = error.downloadUrl
      }

      return dumpReport(report).then(() => {
        process.exit(1)
      })
    })
})()

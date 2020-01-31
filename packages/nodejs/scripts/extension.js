#!/usr/bin/env node

const path = require("path")
const https = require("https")
const fs = require("fs")
const crypto = require("crypto")
const childProcess = require("child_process")

const { TRIPLES } = require("./extension/constants")

const {
  hasLocalBuild,
  hasSupportedArchitecture
} = require("./extension/helpers")

const { createReport } = require("./report")

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
    childProcess.exec(`tar -C ext/ -xzf ${filepath}`, err => {
      return !err ? resolve() : reject(err)
    })
  })
}

function verify(filepath, checksum) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filepath)
      .pipe(crypto.createHash("SHA256").setEncoding("hex"))
      .on("finish", function() {
        this.end()

        if (this.read() === checksum) {
          return resolve()
        } else {
          return reject(new Error("Checksum verification failed"))
        }
      })
  })
}

function getMetadataForTarget(report) {
  const { architecture, target, musl_override } = report.build

  const triple = [
    architecture === "x64" ? "x86_64" : "i686",
    `-${target}`,
    musl_override ? "-musl" : ""
  ]

  return TRIPLES[triple.join("")]
}

// Script logic begins here
;(function() {
  const report = createReport()

  if (hasLocalBuild()) {
    // check for a local build (dev only)
    console.warn(`Using local build for agent. Skipping download.`)
    process.exit(0)
  } else if (hasSupportedArchitecture(report)) {
    // try and get one from the CDN
    const metadata = getMetadataForTarget(report)
    const filename = metadata.downloadUrl.split("/")[4]
    const outputPath = path.join(EXT_PATH, filename)

    return download(metadata.downloadUrl, outputPath)
      .then(filepath => {
        return verify(filepath, metadata.checksum).then(() => extract(filepath))
      })
      .then(() => {
        // once extracted, we can then hand off to node-gyp for building
        // @TODO: add cleanup step
        console.log("The agent has installed successfully!")
        process.exit(0)
      })
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  } else {
    // bail :(
    console.error(
      `AppSignal currently does not support your system architecture 
      (${process.platform} ${process.arch}). Please let us know at 
      support@appsignal.com, we aim to support everything our customers run.`
    )
    process.exit(1)
  }
})()

import fs from "fs"
import path from "path"
import https from "https"
import http from "http"
import { URL, URLSearchParams } from "url"
import { createHash } from "crypto"

import { Extension } from "./extension"
import { Configuration } from "./config"
import { AGENT_VERSION, VERSION } from "./version"
import { JS_TO_RUBY_MAPPING } from "./config/configmap"

interface FileMetadata {
  content?: string[]
  exists: boolean
  mode?: number
  ownership?: {
    gid: number
    uid: number
  }
  path?: string
  type?: string
  writable?: boolean
}

interface ParsingError {
  error: string
  backtrace: []
  raw?: string
}

export class DiagnoseTool {
  #config: Configuration
  #extension: Extension

  constructor({ active = true }) {
    this.#config = new Configuration({ active })
    this.#extension = new Extension({ active })
  }

  /**
   * Reports are serialized to JSON and send to an endpoint that expects
   * snake_case keys, thus the keys in the report on this side must be snake cased also.
   */
  public async generate() {
    let pushApiKeyValidation
    await this.validatePushApiKey()
      .then(result => (pushApiKeyValidation = result))
      .catch(result => (pushApiKeyValidation = result))
    return {
      library: this.getLibraryData(),
      installation: this.getInstallationReport(),
      host: this.getHostData(),
      app: {},
      agent: this.#extension.diagnose(),
      config: {
        options: this.getConfigData(),
        sources: {}
      },
      validation: { push_api_key: pushApiKeyValidation },
      process: {
        uid: process.getuid()
      },
      paths: this.getPathsData()
    }
  }

  private getLibraryData() {
    return {
      language: "nodejs",
      package_version: VERSION,
      agent_version: AGENT_VERSION,
      extension_loaded: this.#extension.isLoaded
    }
  }

  private getHostData() {
    const heroku = !!process.env["DYNO"]

    return {
      architecture: process.arch,
      os: process.platform,
      language_version: process.versions.node,
      heroku,
      root: process.getuid() === 0,
      // @TODO: this is pretty much just a guess right now
      // it assumes docker. no jails, lxc etc.
      // we'll need to adjust this a little later
      running_in_container: hasDockerEnv() || hasDockerCGroup() || heroku
    }
  }

  private getInstallationReport() {
    let rawReport
    try {
      rawReport = fs.readFileSync(reportPath(), "utf8")
      return JSON.parse(rawReport)
    } catch (error) {
      const report = {
        parsing_error: {
          error: `${error.name}: ${error.message}`,
          backtrace: error.stack.split("\n")
        } as ParsingError
      }
      if (rawReport) {
        report.parsing_error.raw = rawReport
      }
      return report
    }
  }

  private async validatePushApiKey() {
    return new Promise((resolve, reject) => {
      const config = this.#config.data
      const params = new URLSearchParams({ api_key: config["apiKey"] })
      const url = new URL(`/1/auth?${params.toString()}`, config["endpoint"])
      const options = { method: "POST" }

      const request = https.request(url, options, function (response) {
        const status = response.statusCode
        if (status === 200) {
          resolve("valid")
        } else if (status === 401) {
          reject("invalid")
        } else {
          reject(`Failed with status ${status}`)
        }
      })
      request.write("{}") // Send empty JSON body
      request.end()
    })
  }

  private getPathsData() {
    const paths: { [key: string]: FileMetadata } = {}

    // we want to fall over if this value isn't present
    // (it should be)
    const logFilePath = <string>this.#config.data.logFilePath!

    // add any paths we want to check to this object!
    const files = {
      working_dir: {
        path: process.cwd()
      },
      log_dir_path: {
        path: this.#config.data.logPath!.replace("/appsignal.log", "")
      },
      "appsignal.log": {
        path: logFilePath,
        content: safeReadFromPath(logFilePath).trimEnd().split("\n")
      }
    }

    Object.entries(files).forEach(([key, data]) => {
      const { path } = data

      try {
        const stats = fs.statSync(path)
        const { mode, gid, uid } = stats

        paths[key] = {
          ...data,
          exists: true,
          mode,
          ownership: {
            gid,
            uid
          },
          type: getPathType(stats),
          writable: isWriteableFile(path)
        }
      } catch (_) {
        paths[key] = {
          ...data,
          exists: false
        }
      }
    })

    return paths
  }

  /**
   * Reads all configuration and re-maps it to keys with
   * snake_case names as they appear in our API.
   */
  private getConfigData() {
    const config: { [key: string]: any } = {}

    Object.keys(this.#config.data).forEach(key => {
      const newKey = JS_TO_RUBY_MAPPING[key]
      config[newKey] = this.#config.data[key]
    })

    return config
  }

  public sendReport(data: object) {
    const json = JSON.stringify({ diagnose: data })

    const config = this.#config.data
    const params = new URLSearchParams({ api_key: config["apiKey"] || "" })

    const diagnoseEndpoint =
      process.env.APPSIGNAL_DIAGNOSE_ENDPOINT || "https://appsignal.com/diag"
    const url = new URL(diagnoseEndpoint)

    const opts = {
      method: "POST",
      protocol: url.protocol,
      host: url.hostname,
      port: url.port,
      path: `${url.pathname}?${params.toString()}`,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": json.length
      },
      cert: fs.readFileSync(
        path.resolve(__dirname, "../cert/cacert.pem"),
        "utf-8"
      )
    }

    const requestModule = url.protocol == "http:" ? http : https
    const request = requestModule.request(opts, (response: any) => {
      const responseStatus = response.statusCode
      response.setEncoding("utf8")

      response.on("data", (responseData: any) => {
        if (responseStatus === 200) {
          const { token } = JSON.parse(responseData.toString())
          console.log(`  Your support token:`, token)
          console.log(
            `  View this report: https://appsignal.com/diagnose/${token}`
          )
        } else {
          console.error(
            "  Error: Something went wrong while submitting the report to AppSignal."
          )
          console.error(`  Response code: ${responseStatus}`)
          console.error(`  Response body:\n${responseData}`)
        }
      })
    })

    request.write(json)
    request.end()
  }
}

// This implementation should match the `packages/nodejs-ext/scripts/report.js`
// implementation to generate the same path.
function reportPath(): string {
  // Navigate up to the app dir. Move up the src dir, package dir, @appsignal
  // dir and node_modules dir.
  const appPath = path.join(__dirname, "../../../../")
  const hash = createHash("sha256")
  hash.update(appPath)
  const reportPathDigest = hash.digest("hex")
  return path.join(`/tmp/appsignal-${reportPathDigest}-install.report`)
}

function isWriteableFile(path: string): boolean {
  try {
    fs.accessSync(path, fs.constants.R_OK)
    return true
  } catch (e) {
    return false
  }
}

function getPathType(stats: fs.Stats) {
  if (stats.isDirectory()) {
    return "directory"
  } else if (stats.isFile()) {
    return "file"
  } else {
    return "unknown"
  }
}

const BYTES_TO_READ_FOR_FILES = 2 * 1024 * 1024 // 2 Mebibytes

/**
 * Attempts to read a UTF-8 from `path`, and either returns the result
 * as a string, or an empty string on error
 */
function safeReadFromPath(path: string): string {
  try {
    return readBytesFromPath(path, BYTES_TO_READ_FOR_FILES)
  } catch (_) {
    return ""
  }
}

function readBytesFromPath(path: string, bytesToRead: number): string {
  let fd
  try {
    const { readLength, startPosition } = readFileOptions(path, bytesToRead)
    fd = fs.openSync(path, "r")
    const buffer = Buffer.alloc(readLength)
    fs.readSync(fd, buffer, 0, readLength, startPosition)
    return buffer.toString("utf8")
  } finally {
    if (fd) {
      fs.closeSync(fd)
    }
  }
}

function readFileOptions(path: string, bytesToRead: number) {
  const stats = fs.statSync(path)
  const fileSize = stats.size
  if (fileSize < bytesToRead) {
    return {
      readLength: fileSize,
      startPosition: 0
    }
  } else {
    const startPosition = fileSize - bytesToRead
    return {
      readLength: bytesToRead,
      startPosition
    }
  }
}

/**
 * the following lines are borrowed from https://github.com/sindresorhus/is-docker/
 * thanks sindre! <3
 */
function hasDockerEnv(): boolean {
  try {
    fs.statSync("/.dockerenv")
    return true
  } catch (_) {
    return false
  }
}

function hasDockerCGroup(): boolean {
  try {
    return fs.readFileSync("/proc/self/cgroup", "utf8").includes("docker")
  } catch (_) {
    return false
  }
}

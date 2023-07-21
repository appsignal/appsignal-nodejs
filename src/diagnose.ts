import fs from "fs"
import path from "path"
import { URL } from "url"

import { isWritable, installReportPath, processGetuid } from "./utils"
import { Extension } from "./extension"
import { Configuration } from "./config"
import { Client } from "./client"
import { AGENT_VERSION, VERSION } from "./version"
import { JS_TO_RUBY_MAPPING } from "./config/configmap"
import { AppsignalOptions } from "./config/options"
import { Transmitter } from "./transmitter"

interface FileMetadata {
  content?: string[]
  exists: boolean
  mode?: string
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

  constructor() {
    this.#config = this.getConfigObject()
    this.#extension = new Extension()
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
      agent: this.#extension.diagnose(),
      config: {
        options: this.#config.data,
        sources: this.#config.sources
      },
      validation: { push_api_key: pushApiKeyValidation },
      process: {
        uid: processGetuid()
      },
      paths: this.getPathsData()
    }
  }

  private getLibraryData() {
    return {
      language: "nodejs",
      package_version: VERSION,
      agent_version: AGENT_VERSION,
      extension_loaded: Extension.isLoaded
    }
  }

  private getHostData() {
    const heroku = !!process.env["DYNO"]

    return {
      architecture: process.arch,
      os: process.platform,
      os_distribution: this.getOsDistribution(),
      language_version: process.versions.node,
      heroku,
      root: processGetuid() === 0,
      running_in_container: this.#extension.runningInContainer()
    }
  }

  private getOsDistribution() {
    const path = "/etc/os-release"
    if (fs.existsSync(path)) {
      try {
        return fs.readFileSync(path, "utf8")
      } catch (error) {
        return `Error reading ${path}: ${error}`
      }
    } else {
      return ""
    }
  }

  private getInstallationReport() {
    let rawReport
    try {
      rawReport = fs.readFileSync(installReportPath(), "utf8")
      return JSON.parse(rawReport)
    } catch (error: any) {
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
    const config = this.#config.data
    const url = new URL(`/1/auth`, config["endpoint"])
    const transmitter = new Transmitter(url.toString())
    let response: Record<string, any> = {}

    await transmitter
      .transmit()
      .then(responseData => {
        response = responseData
      })
      .catch(responseData => {
        response = responseData
      })

    if (response["status"] == 200) {
      return Promise.resolve("valid")
    } else if (response["status"] == 401) {
      return Promise.reject("invalid")
    } else {
      return Promise.reject(
        `Failed to validate: ${response["error"] || response["body"]}`
      )
    }
  }

  private getPathsData() {
    const paths: { [key: string]: FileMetadata } = {}
    const logFilePath = this.#config.logFilePath

    const pathsToCheck = {
      working_dir: {
        path: process.cwd()
      },
      log_dir_path: {
        path: logFilePath ? path.dirname(logFilePath) : ""
      },
      "appsignal.cjs": {
        path: this.clientFilePath() || ""
      },
      "appsignal.log": {
        path: logFilePath || "",
        content: logFilePath
          ? safeReadFromPath(logFilePath).trimEnd().split("\n")
          : []
      }
    }

    Object.entries(pathsToCheck).forEach(([key, data]) => {
      const { path } = data

      if (fs.existsSync(path)) {
        try {
          const stats = fs.statSync(path)
          const { mode, gid, uid } = stats

          paths[key] = {
            ...data,
            exists: true,
            mode: mode.toString(8),
            ownership: {
              gid,
              uid
            },
            type: getPathType(stats),
            writable: isWritable(path)
          }
        } catch (_) {
          paths[key] = {
            ...data,
            exists: true
          }
        }
      } else {
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
   * snake_case names.
   */
  private getConfigData() {
    return this.optionsObject(this.#config.data)
  }

  /**
   * If it can load the client from the `appsignal.cjs` file, get the config
   * object from the initialized client. Otherwise, return a default config object.
   */
  private getConfigObject(): Configuration {
    const clientFilePath = this.clientFilePath()
    // The file is required to execute the client initialization
    // that stores the config object on the global object, making
    // it available calling `Client.config` later.
    if (clientFilePath) {
      process.env._APPSIGNAL_DIAGNOSE = "true"
      try {
        require(clientFilePath)
      } catch (e: any) {
        console.error(`Error loading AppSignal client file ${e.message}`)
      }

      delete process.env._APPSIGNAL_DIAGNOSE
    } else {
      console.warn(
        "Could not find AppSignal client file at " +
          `[${Configuration.clientFilePaths().join(",")}]. ` +
          "Configuration in report may be incomplete."
      )
    }

    return Client.config ?? new Configuration({})
  }

  private clientFilePath() {
    return this.getCustomClientFilePath() || Configuration.clientFilePath
  }

  /**
   * Converts an AppsignalOptions object into a plain JS object,
   * re-mapping its keys to snake_case names as they appear
   * in our API.
   */
  private optionsObject(options: Partial<AppsignalOptions>) {
    const config: { [key: string]: any } = {}

    Object.keys(options).forEach(key => {
      const newKey = (JS_TO_RUBY_MAPPING as Record<string, any>)[key]
      if (newKey) {
        config[newKey] = (options as Record<string, any>)[key]
      }
    })

    return config
  }

  /**
   * Reads all configuration sources, remapping each source's
   * option keys with snake_case names.
   */
  private getSources() {
    return Object.entries(this.#config.sources).reduce(
      (sources, [name, options]) => {
        return { ...sources, [name]: this.optionsObject(options) }
      },
      {}
    )
  }

  private getCustomClientFilePath() {
    const flagIndex = process.argv.indexOf("--config")

    if (flagIndex !== -1 && flagIndex + 1 < process.argv.length) {
      const filePath = process.argv[flagIndex + 1]

      if (path.isAbsolute(filePath)) {
        return filePath
      } else {
        return path.resolve(filePath)
      }
    }
  }

  public async sendReport(data: Record<string, any>) {
    data.config.options = this.getConfigData()
    data.config.sources = this.getSources()
    const json = JSON.stringify({ diagnose: data })

    const diagnoseEndpoint =
      process.env.APPSIGNAL_DIAGNOSE_ENDPOINT || "https://appsignal.com/diag"

    const transmitter = new Transmitter(diagnoseEndpoint, json)

    await transmitter
      .transmit()
      .then(responseData => {
        if (responseData["status"] == 200) {
          const { token } = responseData["body"]
          console.log(`  Your support token:`, token)
          console.log(
            `  View this report:   https://appsignal.com/diagnose/${token}`
          )
        } else {
          console.error(
            "  Error: Something went wrong while submitting the report to AppSignal."
          )
          console.error(`  Response code: ${responseData["status"]}`)
          console.error(
            `  Response body:\n${JSON.stringify(responseData["body"])}`
          )
        }
      })
      .catch(responseData => {
        console.error(
          `  Error submitting the report: ${responseData["error"].message}`
        )
      })
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

import path from "path"
import os from "os"
import fs from "fs"

import { VERSION } from "./version"
import { isWritable } from "./utils"
import { AppsignalOptions } from "./config/options"
import { ENV_TO_KEY_MAPPING, PRIVATE_ENV_MAPPING } from "./config/configmap"

/**
 * The AppSignal configuration object.
 *
 * Manages configuration loaded at runtime, and from other sources.
 * Writes environment variables used to configure the agent.
 *
 * @class
 */
export class Configuration {
  data: Partial<AppsignalOptions>
  sources: Record<string, Partial<AppsignalOptions>>

  constructor(options: Partial<AppsignalOptions>) {
    this.sources = {
      default: this._defaultValues(),
      system: this._systemValues(),
      env: this._loadFromEnvironment(),
      initial: options
    }

    this.data = Object.values(this.sources).reduce((data, options) => {
      return { ...data, ...options }
    }, {})

    this.writePrivateConfig(this.data)
  }

  /**
   * Returns `true` if the current configuration is valid.
   */
  public get isValid(): boolean {
    return (this.data.pushApiKey || "").trim() !== ""
  }

  public get logFilePath(): string | undefined {
    const filename = "appsignal.log"
    let logPath = this.data["logPath"]
    if (logPath && path.extname(logPath) != "") {
      console.warn(
        "DEPRECATED: File names are no longer supported in the 'logPath' config option. Changing the filename to 'appsignal.log'"
      )

      logPath = path.dirname(logPath)
    }

    if (logPath && isWritable(logPath)) {
      return path.join(logPath, filename)
    } else {
      const tmpDir = this._tmpdir()
      if (isWritable(tmpDir)) {
        if (logPath) {
          console.warn(
            `Unable to log to '${logPath}'. Logging to '${tmpDir}' instead. Please check the permissions of the 'logPath' directory.`
          )
        }
        return path.join(tmpDir, filename)
      } else {
        let configuredPath = ""
        if (logPath) {
          configuredPath = `'${logPath}' or `
        }
        console.warn(
          `Unable to log to ${configuredPath}'${tmpDir}' fallback. Please check the permissions of these directories.`
        )
      }
    }
  }

  static get clientFilePath(): string | undefined {
    return this.clientFilePaths().find(fs.existsSync)
  }

  static clientFilePaths(): string[] {
    const filename = "appsignal.cjs"

    return [
      path.join(process.cwd(), filename),
      path.join(process.cwd(), "src", filename)
    ]
  }

  /**
   * Returns default OS tmp dir. Uses OS package for Windows. Linux and macOS
   * have `/tmp` hardcoded as a default
   *
   * @private
   */
  private _tmpdir(): string {
    const isWindows = process.platform == "win32"

    if (isWindows) {
      return os.tmpdir()
    } else {
      return "/tmp"
    }
  }

  /**
   * Explicit default configuration values
   *
   * @private
   */
  private _defaultValues(): Partial<AppsignalOptions> {
    return {
      active: false,
      caFilePath: path.join(__dirname, "../cert/cacert.pem"),
      disableDefaultInstrumentations: false,
      dnsServers: [],
      enableHostMetrics: true,
      enableMinutelyProbes: true,
      enableStatsd: false,
      enableNginxMetrics: false,
      endpoint: "https://push.appsignal.com",
      environment: process.env.NODE_ENV || "development",
      filesWorldAccessible: true,
      filterParameters: [],
      filterSessionData: [],
      ignoreActions: [],
      ignoreErrors: [],
      ignoreNamespaces: [],
      log: "file",
      loggingEndpoint: "https://appsignal-endpoint.net",
      requestHeaders: [
        "accept",
        "accept-charset",
        "accept-encoding",
        "accept-language",
        "cache-control",
        "connection",
        "content-length",
        "range"
      ],
      sendEnvironmentMetadata: true,
      sendParams: true,
      sendSessionData: true
    }
  }

  /**
   * Config options based on the host environment.
   *
   * @private
   */
  private _systemValues(): { [key: string]: any } {
    const config = {} as { [key: string]: any }
    if (process.env.DYNO) {
      config["log"] = "stdout"
    }
    return config
  }

  /**
   * Loads environment variables into a key-value structure.
   *
   * @private
   */
  private _loadFromEnvironment(): { [key: string]: any } {
    const conf: { [key: string]: any } = {}

    Object.entries(ENV_TO_KEY_MAPPING).forEach(([k, v]) => {
      const current = process.env[k]

      if (current) {
        try {
          // attempt to extract a value from a string
          conf[v] = eval(current)
        } catch (e) {
          conf[v] = current
        }
      }
    })

    return conf
  }

  /**
   * Writes environment variables from a key-value structure.
   *
   * @private
   */
  private writePrivateConfig(config: { [key: string]: any }) {
    this.writePrivateConstants()
    const logFilePath = this.logFilePath
    if (logFilePath) {
      process.env["_APPSIGNAL_LOG_FILE_PATH"] = logFilePath
    }

    // write to a "private" environment variable if it exists in the
    // config structure
    Object.entries(PRIVATE_ENV_MAPPING).forEach(([k, v]) => {
      const current = config[v]

      if (current && Array.isArray(current)) {
        if (current.length === 0) return
        process.env[k] = current.join(",")
      }

      if (current) process.env[k] = String(current)
    })
  }

  /**
   * Writes private environment variables that are not user configured,
   * and static in the lifecycle of the agent.
   *
   * @function
   * @private
   */
  private writePrivateConstants() {
    const priv = {
      _APPSIGNAL_AGENT_PATH: path.join(__dirname, "/../ext"),
      _APPSIGNAL_PROCESS_NAME: process.title,
      _APPSIGNAL_LANGUAGE_INTEGRATION_VERSION: `nodejs-${VERSION}`,
      _APPSIGNAL_APP_PATH: process.cwd()
    }

    Object.entries(priv).forEach(([k, v]) => (process.env[k] = v))
  }
}

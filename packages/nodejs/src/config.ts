import path from "path"
import os from "os"
import fs from "fs"

import { VERSION } from "./version"
import { AppsignalOptions } from "./interfaces/options"
import { ENV_TO_KEY_MAPPING, PRIVATE_ENV_MAPPING } from "./config/configmap"
import { HashMap } from "@appsignal/types"

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
  sources: HashMap<Partial<AppsignalOptions>>

  constructor(options: Partial<AppsignalOptions>) {
    if (options.apiKey) {
      console.warn(
        "DEPRECATED: The `apiKey` config option was renamed to `pushApiKey`. Please rename the config option given to the Appsignal module."
      )
      options.pushApiKey = options.apiKey
      delete options.apiKey
    }
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
   * Returns `true` if the client is in debug mode
   */
  public get debug(): boolean {
    return this.data.debug || false
  }

  /**
   * Returns `true` if the current configuration is valid.
   */
  public get isValid(): boolean {
    return (this.data.pushApiKey || "").trim() !== ""
  }

  public get logFilePath(): string {
    let logPath = this.data["logPath"]!

    if (path.extname(logPath) != "") {
      console.warn(
        "DEPRECATED: File names are no longer supported in the 'logPath' config option. Changing the filename to 'appsignal.log'"
      )

      logPath = path.dirname(logPath)
    }

    try {
      fs.accessSync(logPath, fs.constants.W_OK)
    } catch (_err) {
      const newLogPath = this._tmpdir()

      console.warn(
        `Unable to log to '${logPath}'. Logging to '${newLogPath}' instead. Please check the permissions for the configured 'logPath' directory`
      )

      logPath = newLogPath
    }

    return path.join(logPath, "appsignal.log")
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
  private _defaultValues(): { [key: string]: any } {
    return {
      caFilePath: path.join(__dirname, "../cert/cacert.pem"),
      debug: false,
      dnsServers: [],
      enableHostMetrics: true,
      enableMinutelyProbes: true,
      enableStatsd: false,
      endpoint: "https://push.appsignal.com",
      environment: process.env.NODE_ENV || "development",
      filesWorldAccessible: true,
      filterParameters: [],
      filterSessionData: [],
      ignoreActions: [],
      ignoreErrors: [],
      ignoreNamespaces: [],
      log: "file",
      logPath: this._tmpdir(),
      requestHeaders: [
        "accept",
        "accept-charset",
        "accept-encoding",
        "accept-language",
        "cache-control",
        "connection",
        "content-length",
        "path-info",
        "range",
        "request-method",
        "request-uri",
        "server-name",
        "server-port",
        "server-protocol"
      ],
      transactionDebugMode: false
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
    process.env["_APPSIGNAL_LOG_FILE_PATH"] = this.logFilePath

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
      // @TODO: is this path always correct?
      _APPSIGNAL_AGENT_PATH: path.join(__dirname, "/../../nodejs-ext/ext"),
      _APPSIGNAL_PROCESS_NAME: process.title,
      _APPSIGNAL_LANGUAGE_INTEGRATION_VERSION: `nodejs-${VERSION}`,
      _APPSIGNAL_APP_PATH: process.cwd()
    }

    Object.entries(priv).forEach(([k, v]) => (process.env[k] = v))
  }
}

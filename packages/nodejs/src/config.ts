import path from "path"

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
    this.sources = {
      default: this._defaultValues(),
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
    return (this.data.apiKey || "").trim() !== ""
  }

  public get logFilePath(): string {
    let logPath = this.data["logPath"]!

    if (!logPath.endsWith("appsignal.log")) {
      logPath = path.join(logPath, "appsignal.log")
    }

    return logPath
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
      filterDataKeys: [],
      filterParameters: [],
      filterSessionData: [],
      ignoreActions: [],
      ignoreErrors: [],
      ignoreNamespaces: [],
      log: "file",
      logPath: "/tmp",
      transactionDebugMode: false
    }
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

import path from "path"

import { VERSION } from "./version"
import { AppsignalOptions } from "./types/options"
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
  public data: Partial<AppsignalOptions>

  constructor(options: Partial<AppsignalOptions>) {
    writePrivateConstants()

    this.data = {
      debug: false,
      log: "file",
      logPath: "/tmp/appsignal.log",
      caFilePath: path.join(__dirname, "../cert/cacert.pem"),
      endpoint: "https://push.appsignal.com",
      environment: process.env.NODE_ENV || "development",
      ...this._loadFromEnvironment(),
      ...options
    }

    this._write(this.data)
  }

  /**
   * Returns `true` if the client is in debug mode
   */
  public get debug(): boolean {
    return this.data.debug || false
  }

  /**
   * Returns `true` if the current configuration is valid.
   *
   * @todo
   */
  public get isValid(): boolean {
    return true
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
  private _write(config: { [key: string]: any }) {
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

    return
  }
}

/**
 * Writes private environment variables that are not user configured,
 * and static in the lifecycle of the agent.
 *
 * @function
 * @private
 */
function writePrivateConstants() {
  const priv = {
    // @TODO: is this path always correct?
    _APPSIGNAL_AGENT_PATH: path.join(__dirname, "/../../nodejs-ext/ext"),
    _APPSIGNAL_PROCESS_NAME: process.title,
    _APPSIGNAL_LANGUAGE_INTEGRATION_VERSION: `nodejs-${VERSION}`,
    _APPSIGNAL_APP_PATH: process.cwd()
  }

  Object.entries(priv).forEach(([k, v]) => (process.env[k] = v))
}

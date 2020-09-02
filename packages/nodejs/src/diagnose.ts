import fs from "fs"

import { Agent } from "./agent"
import { Configuration } from "./config"
import { AGENT_VERSION, VERSION } from "./version"
import { JS_TO_RUBY_MAPPING } from "./config/configmap"

export class DiagnoseTool {
  #config: Configuration
  #agent: Agent

  constructor({ active = true }) {
    this.#config = new Configuration({ active })
    this.#agent = new Agent({ active })
  }

  /**
   * Reports are serialized to JSON and send to an endpoint that expects
   * snake_case keys, thus the keys in the report on this side must be snake cased also.
   */
  public generate() {
    return {
      library: this.getLibraryData(),
      installation: this.getInstallationReport(),
      host: this.getHostData(),
      app: {},
      agent: this.#agent.diagnose(),
      config: {
        options: this.getConfigData(),
        sources: {}
      },
      validation: { push_api_key: "valid" },
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
      extension_loaded: this.#agent.isLoaded
    }
  }

  private getHostData() {
    return {
      architecture: process.arch,
      os: process.platform,
      language_version: process.versions.node,
      heroku: !!process.env["DYNO"],
      root: process.getuid() === 0,
      running_in_container: false
    }
  }

  private getInstallationReport() {
    try {
      const report = fs.readFileSync(
        "/tmp/appsignal-install-report.json",
        "utf8"
      )

      return report ? JSON.parse(report) : {}
    } catch (e) {
      return {}
    }
  }

  private getPathsData() {
    return {}
  }

  private getConfigData() {
    const config: { [key: string]: any } = {}

    Object.keys(this.#config.data).forEach(key => {
      const newKey = JS_TO_RUBY_MAPPING[key]
      config[newKey] = this.#config.data[key]
    })

    return config
  }
}

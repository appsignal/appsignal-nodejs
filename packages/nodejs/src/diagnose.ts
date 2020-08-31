import fs from "fs"

import { Agent } from "./agent"
import { Configuration } from "./config"
import { AGENT_VERSION, VERSION } from "./version"

export class DiagnoseTool {
  #config: Configuration
  #agent: Agent

  constructor() {
    this.#config = new Configuration({})
    this.#agent = new Agent({ active: true })
  }

  public generate(): string {
    return JSON.stringify({
      library: this.getLibraryData(),
      installation: this.getInstallationReport(),
      host: this.getHostData(),
      app: {},
      agent: this.#agent.diagnose(),
      config: {
        options: {},
        sources: {}
      },
      validation: { push_api_key: "valid" },
      process: {
        uid: process.getuid()
      },
      paths: this.getPathsData()
    })
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

      return !report ? JSON.parse(report) : {}
    } catch (e) {
      return {}
    }
  }

  private getPathsData() {
    return {}
  }
}

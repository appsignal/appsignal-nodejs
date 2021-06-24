import fs from "fs"

import { Agent } from "./agent"
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
    const paths: { [key: string]: FileMetadata } = {}

    // we want to fall over if this value isn't present
    // (it should be)
    const logPath = this.#config.data.logPath!

    // add any paths we want to check to this object!
    const files = {
      working_dir: {
        path: process.cwd()
      },
      log_dir_path: {
        path: logPath.replace("/appsignal.log", "")
      },
      "appsignal.log": {
        path: logPath + "/appsignal.log",
        content: safeReadFromPath(logPath + "/appsignal.log").split("\n")
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

/**
 * Attempts to read a UTF-8 from `path`, and either returns the result
 * as a string, or an empty string on error
 */
function safeReadFromPath(path: string): string {
  try {
    return fs.readFileSync(path, "utf8")
  } catch (_) {
    return ""
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

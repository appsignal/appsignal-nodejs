const { DiagnoseTool } = require("../diagnose")
const { processGetuid } = require("../utils")
const util = require("util")
const readline = require("readline")

export class Diagnose {
  #diagnose: typeof DiagnoseTool

  constructor() {
    this.#diagnose = new DiagnoseTool()
  }

  public async run() {
    const data = await this.#diagnose.generate()

    console.log(`AppSignal diagnose`)
    console.log(`=`.repeat(80))
    console.log(`Use this information to debug your configuration.`)
    console.log(`More information is available on the documentation site.`)
    console.log(`https://docs.appsignal.com/`)
    console.log(`Send this output to support@appsignal.com if you need help.`)
    console.log(`=`.repeat(80))

    this.print_newline()

    console.log(`AppSignal library`)
    console.log(`  Language: Node.js`)
    console.log(
      `  Package version: ${format_value(data["library"]["package_version"])}`
    )
    console.log(
      `  Agent version: ${format_value(data["library"]["agent_version"])}`
    )
    console.log(
      `  Extension loaded: ${format_value(data["library"]["extension_loaded"])}`
    )

    this.print_newline()

    console.log(`Extension installation report`)
    const installReport = data["installation"]
    const parsingError = installReport["parsing_error"]
    if (parsingError) {
      console.log(`  Error found while parsing the report.`)
      console.log(`  Error: ${parsingError["error"]}`)
      if (parsingError["raw"]) {
        console.log(`  Raw report:`)
        console.log(parsingError["raw"])
      }
    } else {
      console.log(`  Installation result`)
      console.log(`    Status: ${installReport["result"]["status"]}`)
      const resultMessage = data["installation"]["result"]["message"]
      if (resultMessage) {
        console.log(`    Message: ${resultMessage}`)
      }
      const resultError = data["installation"]["result"]["error"]
      if (resultError) {
        console.log(`    Error: ${resultError}`)
      }

      console.log(`  Language details`)
      console.log(
        `    Node.js version: ${format_value(
          data["installation"]["language"]["version"]
        )}`
      )
      console.log(`  Download details`)
      console.log(
        `    Download URL: ${format_value(
          data["installation"]["download"]["download_url"]
        )}`
      )
      console.log(
        `    Checksum: ${format_value(
          data["installation"]["download"]["checksum"]
        )}`
      )
      console.log(`  Build details`)
      console.log(
        `    Install time: ${format_value(
          data["installation"]["build"]["time"]
        )}`
      )
      console.log(
        `    Architecture: ${format_value(
          data["installation"]["build"]["architecture"]
        )}`
      )
      console.log(
        `    Target: ${format_value(data["installation"]["build"]["target"])}`
      )
      console.log(
        `    Musl override: ${format_value(
          data["installation"]["build"]["musl_override"]
        )}`
      )
      console.log(
        `    Linux ARM override: ${format_value(
          data["installation"]["build"]["linux_arm_override"]
        )}`
      )
      console.log(
        `    Library type: ${format_value(
          data["installation"]["build"]["library_type"]
        )}`
      )
      console.log(
        `    Dependencies: ${format_value(
          data["installation"]["build"]["dependencies"]
        )}`
      )
      console.log(
        `    Flags: ${format_value(data["installation"]["build"]["flags"])}`
      )
      console.log(`  Host details`)
      console.log(
        `    Root user: ${format_value(
          data["installation"]["host"]["root_user"]
        )}`
      )
      console.log(
        `    Dependencies: ${format_value(
          data["installation"]["host"]["dependencies"]
        )}`
      )
    }

    this.print_newline()

    console.log(`Host information`)
    console.log(`  Architecture: ${format_value(data["host"]["architecture"])}`)
    console.log(`  Operating System: ${format_value(data["host"]["os"])}`)
    console.log(
      `  Node.js version: ${format_value(data["host"]["language_version"])}`
    )
    console.log(`  Root user: ${format_value(data["host"]["root"])}`)
    console.log(
      `  Running in container: ${format_value(
        data["host"]["running_in_container"]
      )}`
    )
    this.print_newline()

    this.printAgentDiagnose(data["agent"])

    this.print_newline()

    this.printConfiguration(data["config"], this.#diagnose.clientFilePath())

    this.print_newline()

    console.log(`Read more about how the diagnose config output is rendered`)
    console.log(
      `https://docs.appsignal.com/nodejs/3.x/command-line/diagnose.html`
    )

    this.print_newline()

    console.log(`Validation`)
    console.log(
      `  Validating Push API key: ${this.colorize(
        data["validation"]["push_api_key"]
      )}`
    )

    this.print_newline()

    console.log(`Paths`)

    this.printPath("Current working directory", data["paths"]["working_dir"])
    this.print_newline()
    this.printPath("Log directory", data["paths"]["log_dir_path"])
    this.print_newline()
    this.printPath("AppSignal client file", data["paths"]["appsignal.cjs"])
    this.print_newline()
    this.printPath("AppSignal log", data["paths"]["appsignal.log"])
    this.print_newline()

    console.log(`Diagnostics report`)
    console.log(`  Do you want to send this diagnostics report to AppSignal?`)
    console.log(`  If you share this report you will be given a link to`)
    console.log(`  AppSignal.com to validate the report.`)
    console.log(`  You can also contact us at support@appsignal.com`)
    console.log(`  with your support token.`)

    this.print_newline()

    if (process.argv.includes("--no-send-report")) {
      console.log(
        `  Not sending report. (Specified with the --no-send-report option.)`
      )
    } else if (process.argv.includes("--send-report")) {
      await this.sendReport(data)
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      // eslint-disable-next-line @typescript-eslint/no-this-alias
      const self = this
      rl.question(
        `  Send diagnostics report to AppSignal? (Y/n): `,
        async function (answer: string) {
          switch ((answer || "y").toLowerCase()) {
            case "y":
              await self.sendReport(data)
              break

            default:
              console.log(`  Not sending diagnostics information to AppSignal.`)
          }

          rl.close()
        }
      )
    }
  }

  printPath(label: string, path: Record<string, any>) {
    console.log(`  ${label}`)
    console.log(`    Path: ${format_value(path["path"])}`)
    if (!path["exists"]) {
      console.log(`    Exists?: false`)
      return
    }
    console.log(`    Writable?: ${format_value(path["writable"])}`)
    const processUid = processGetuid()
    const fileUid = path["ownership"]["uid"]
    const isOwner = processUid == fileUid
    console.log(
      `    Ownership?: ${format_value(
        isOwner
      )} (file: ${fileUid}, process: ${processUid})`
    )
    const contents = path["content"]
    if (contents) {
      console.log(`    Contents (last 10 lines):`)
      console.log(contents.slice(contents.length - 10).join("\n"))
    }
  }

  async sendReport(data: object) {
    console.log("  Transmitting diagnostics report")
    console.log("")
    await this.#diagnose.sendReport(data)
  }

  printAgentDiagnose(report: Record<string, any>) {
    if (report["error"]) {
      console.log("  Error while parsing agent diagnostics report:")
      console.log(`    Error: ${report["error"]}`)
      console.log(`    Output: ${report["output"]}`)
    } else {
      console.log("Agent diagnostics")
      const reportDefinition = this.agentDiagnosticTestDefinition()
      for (const component in reportDefinition) {
        const componentDefinition = reportDefinition[component]
        const componentTests = componentDefinition["tests"]
        console.log(`  ${componentDefinition.label}`)
        for (const category in componentTests) {
          const tests = componentTests[category]
          for (const testName in tests) {
            const testDefinition = tests[testName]
            const componentReport = report[component] || {}
            const categoryReport = componentReport[category] || {}
            const testReport = categoryReport[testName] || {}
            this.printAgentTest(testDefinition, testReport)
          }
        }
      }
    }
  }

  printAgentTest(definition: Record<string, any>, test: Record<string, any>) {
    const value = test["result"]
    const error = test["error"]
    const output = test["output"]

    let formattedValue
    if (value !== undefined) {
      const stringValue = value.toString()
      formattedValue = definition.values
        ? definition.values[stringValue]
        : stringValue
    }
    if (!formattedValue) {
      formattedValue = "-"
    }
    console.log(`    ${definition["label"]}: ${formattedValue}`)
    if (error) {
      console.log(`      Error: ${error}`)
    }
    if (output) {
      console.log(`      Output: ${output}`)
    }
  }

  agentDiagnosticTestDefinition(): Record<string, any> {
    return {
      extension: {
        label: "Extension tests",
        tests: {
          config: {
            valid: {
              label: "Configuration",
              values: { true: "valid", false: "invalid" }
            }
          }
        }
      },
      agent: {
        label: "Agent tests",
        tests: {
          boot: {
            started: {
              label: "Started",
              values: { true: "started", false: "not started" }
            }
          },
          host: {
            uid: { label: "Process user id" },
            gid: { label: "Process user group id" }
          },
          config: {
            valid: {
              label: "Configuration",
              values: { true: "valid", false: "invalid" }
            }
          },
          logger: {
            started: {
              label: "Logger",
              values: { true: "started", false: "not started" }
            }
          },
          working_directory_stat: {
            uid: { label: "Working directory user id" },
            gid: { label: "Working directory user group id" },
            mode: { label: "Working directory permissions" }
          },
          lock_path: {
            created: {
              label: "Lock path",
              values: { true: "writable", false: "not writable" }
            }
          }
        }
      }
    }
  }

  printConfiguration(
    {
      options,
      sources
    }: {
      options: { [key: string]: any }
      sources: { [source: string]: { [key: string]: any } }
    },
    clientFilePath: string
  ) {
    console.log(`Configuration`)

    if (Object.keys(sources.initial).length === 0) {
      console.log(
        `\x1b[31mWarning\x1b[0m: The initialiser file ('${clientFilePath}') could` +
          " not be found. The configuration shown here may be incomplete."
      )
    }

    Object.keys(options)
      .sort()
      .forEach(key => {
        const keySources = this.configurationKeySources(key, sources)

        if (Object.keys(keySources).length == 1) {
          const source = Object.keys(keySources)[0]

          let extra = ""
          if (source !== "default") {
            extra = ` (Loaded from: ${source})`
          }

          console.log(`  ${key}: ${format_value(options[key])}${extra}`)
        } else {
          console.log(`  ${key}: ${format_value(options[key])}`)
          console.log(`    Sources:`)
          const maxSourceLength = Object.keys(keySources)
            // Adding one to account for the `:` after the source name.
            .map(source => source.length + 1)
            .reduce((max, source) => Math.max(max, source), 0)

          Object.entries(keySources).forEach(([source, value]) => {
            source = `${source}:`.padEnd(maxSourceLength, " ")
            console.log(`      ${source} ${format_value(value)}`)
          })
        }
      })
  }

  configurationKeySources(
    key: string,
    sources: { [source: string]: { [key: string]: any } }
  ): { [source: string]: any } {
    return Object.entries(sources).reduce(
      (keySources, [source, sourceOptions]) => {
        if (Object.prototype.hasOwnProperty.call(sourceOptions, key)) {
          return { ...keySources, [source]: sourceOptions[key] }
        } else {
          return keySources
        }
      },
      {}
    )
  }

  print_newline() {
    console.log(``)
  }

  colorize(value: string) {
    switch (value) {
      case "invalid":
        return `\x1b[31minvalid\x1b[0m`
      case "valid":
        return `\x1b[32mvalid\x1b[0m`
      default:
        return value
    }
  }
}

function format_value(value: any) {
  if (typeof value == "object") {
    return JSON.stringify(value)
  } else {
    return util.inspect(value)
  }
}

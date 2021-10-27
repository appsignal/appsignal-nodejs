const { DiagnoseTool } = require("../diagnose")
const fs = require("fs")
const https = require("https")
const path = require("path")
const util = require("util")
const readline = require("readline")
import { HashMap } from "@appsignal/types"

export class Diagnose {
  public async run() {
    const data = await new DiagnoseTool({}).generate()

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

    console.log(`Configuration`)
    console.log(
      `  Environment: ${format_value(data["config"]["options"]["env"])}`
    )

    console.log(`  debug: ${format_value(data["config"]["options"]["debug"])}`)

    console.log(`  log: ${format_value(data["config"]["options"]["log"])}`)

    console.log(
      `  endpoint: ${format_value(data["config"]["options"]["endpoint"])}`
    )
    console.log(
      `  ca_file_path: ${format_value(
        data["config"]["options"]["ca_file_path"]
      )}`
    )
    console.log(
      `  active: ${format_value(data["config"]["options"]["active"])}`
    )
    console.log(
      `  push_api_key: ${format_value(
        data["config"]["options"]["push_api_key"]
      )}`
    )

    this.print_newline()

    console.log(`Read more about how the diagnose config output is rendered`)
    console.log(`https://docs.appsignal.com/nodejs/command-line/diagnose.html`)

    this.print_newline()

    console.log(`Validation`)
    console.log(
      `  Validating Push API key: ${this.colorize(
        data["validation"]["push_api_key"]
      )}`
    )

    this.print_newline()

    console.log(`Paths`)

    var contents = data["paths"]["appsignal.log"]["content"]

    console.log(`  Current working directory`)
    console.log(
      `    Path: ${format_value(data["paths"]["working_dir"]["path"])}`
    )

    this.print_newline()

    console.log(`  Log directory`)
    console.log(
      `    Path: ${format_value(data["paths"]["log_dir_path"]["path"])}`
    )

    this.print_newline()

    console.log(`  AppSignal log`)
    console.log(
      `    Path: ${format_value(data["paths"]["appsignal.log"]["path"])}`
    )
    console.log(`    Contents \(last 10 lines\):`)
    console.log(contents.slice(contents.length - 10).join("\n"))

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
      this.send_report(data)
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      })

      let self = this
      rl.question(
        `  Send diagnostics report to AppSignal? (Y/n): `,
        function (answer: String) {
          switch (answer || "y") {
            case "y":
              self.send_report(data)
              break

            default:
              console.log(`  Not sending diagnostics information to AppSignal.`)
          }

          rl.close()
        }
      )
    }
  }

  printAgentDiagnose(report: HashMap<any>) {
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

  printAgentTest(definition: HashMap<any>, test: HashMap<any>) {
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

  agentDiagnosticTestDefinition(): HashMap<any> {
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

  send_report(data: object) {
    const json = JSON.stringify(data)

    const opts = {
      port: 443,
      method: "POST",
      host: "appsignal.com",
      path: "/diag",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": json.length
      },
      cert: fs.readFileSync(
        path.resolve(__dirname, "../../cert/cacert.pem"),
        "utf-8"
      )
    }

    const req = https.request(opts, (res: any) => {
      res.setEncoding("utf8")

      // print token to the console
      res.on("data", (chunk: any) => {
        const { token } = JSON.parse(chunk.toString())
        console.log(`  Your support token:`, token)
        console.log(
          `  View this report: https://appsignal.com/diagnose/${token}`
        )
      })
    })

    req.on("error", (e: any) => {
      console.error(`Problem with diagnose request: ${e.message}`)
    })

    req.write(json)
    req.end()
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
  return util.inspect(value)
}

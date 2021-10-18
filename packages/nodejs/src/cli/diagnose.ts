const { DiagnoseTool } = require("../diagnose")
const fs = require("fs")
const https = require("https")
const path = require("path")
const util = require("util")
const readline = require("readline")

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
    console.log(`  Package version: ${data["library"]["package_version"]}`)
    console.log(`  Agent version: ${data["library"]["agent_version"]}`)
    console.log(
      `  Extension loaded: ${this.format_value(
        data["library"]["extension_loaded"]
      )}`
    )

    this.print_newline()

    console.log(`Extension installation report`)
    console.log(`  Installation result`)
    const installReport = data["installation"]
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
      `    Node.js version: ${data["installation"]["language"]["version"]}`
    )
    console.log(`  Download details`)
    console.log(
      `    Download URL: ${data["installation"]["download"]["download_url"]}`
    )
    console.log(`    Checksum: ${data["installation"]["download"]["checksum"]}`)
    console.log(`  Build details`)
    console.log(`    Install time: ${data["installation"]["build"]["time"]}`)
    console.log(
      `    Architecture: ${data["installation"]["build"]["architecture"]}`
    )
    console.log(`    Target: ${data["installation"]["build"]["target"]}`)
    console.log(
      `    Musl override: ${data["installation"]["build"]["musl_override"]}`
    )
    console.log(
      `    Linux ARM override: ${data["installation"]["build"]["linux_arm_override"]}`
    )
    console.log(
      `    Library type: ${data["installation"]["build"]["library_type"]}`
    )
    console.log(`  Host details`)
    console.log(`    Root user: ${data["installation"]["host"]["root_user"]}`)
    console.log(
      `    Dependencies: ${this.format_value(
        data["installation"]["host"]["dependencies"]
      )}`
    )

    this.print_newline()

    console.log(`Host information`)
    console.log(`  Architecture: ${data["host"]["architecture"]}`)
    console.log(`  Operating System: ${data["host"]["os"]}`)
    console.log(`  Node.js version: ${data["host"]["language_version"]}`)
    console.log(`  Root user: ${this.format_value(data["host"]["root"])}`)
    console.log(
      `  Running in container: ${this.format_value(
        data["host"]["running_in_container"]
      )}`
    )

    this.print_newline()

    console.log(`Configuration`)
    console.log(
      `  Environment: ${this.format_value(data["config"]["options"]["env"])}`
    )

    console.log(
      `  debug: ${this.format_value(data["config"]["options"]["debug"])}`
    )

    console.log(`  log: ${this.format_value(data["config"]["options"]["log"])}`)

    console.log(
      `  endpoint: ${this.format_value(data["config"]["options"]["endpoint"])}`
    )
    console.log(
      `  ca_file_path: ${this.format_value(
        data["config"]["options"]["ca_file_path"]
      )}`
    )
    console.log(
      `  active: ${this.format_value(data["config"]["options"]["active"])}`
    )
    console.log(
      `  push_api_key: ${this.format_value(
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
      `    Path: ${this.format_value(data["paths"]["working_dir"]["path"])}`
    )

    this.print_newline()

    console.log(`  Log directory`)
    console.log(
      `    Path: ${this.format_value(data["paths"]["log_dir_path"]["path"])}`
    )

    this.print_newline()

    console.log(`  AppSignal log`)
    console.log(
      `    Path: ${this.format_value(data["paths"]["appsignal.log"]["path"])}`
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

  format_value(value: any) {
    return util.inspect(value)
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

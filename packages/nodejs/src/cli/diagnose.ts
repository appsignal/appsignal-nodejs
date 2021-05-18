const { DiagnoseTool } = require("../diagnose")
const util = require("util")

export class Diagnose {
  public run() {
    const data = new DiagnoseTool({}).generate()

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
    console.log(`    Status: success`)
    console.log(`  Language details`)
    console.log(`    Node.js version: ${data["host"]["language_version"]}`)
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

    console.log(`  Host information`)
    console.log(`    Architecture: ${data["host"]["architecture"]}`)
    console.log(`    Operating System: ${data["host"]["os"]}`)
    console.log(`    Node.js version: ${data["host"]["language_version"]}`)
    console.log(`    Root user: ${this.format_value(data["host"]["root"])}`)
    console.log(
      `    Running in container: ${this.format_value(
        data["host"]["running_in_container"]
      )}`
    )
  }

  print_newline() {
    console.log(``)
  }

  format_value(value: any) {
    return util.inspect(value)
  }
}

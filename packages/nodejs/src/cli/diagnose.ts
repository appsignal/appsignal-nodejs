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
      `  Extension loaded: ${this.yes_or_no(
        data["library"]["extension_loaded"]
      )}`
    )
  }

  yes_or_no(value: boolean) {
    return value ? "yes" : "no"
  }

  print_newline() {
    console.log(``)
  }
}

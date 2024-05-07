import fs from "fs"
import { reportPath, processTarget } from "../scripts/extension/support/helpers"

type ExtensionWrapper = {
  isLoaded: boolean
  extension: any
  span: any
  datamap: any
  dataarray: any
  metrics: any
}

let mod: ExtensionWrapper

function fetchInstalledArch(): [string, string] | [] {
  try {
    const rawReport = fs.readFileSync(reportPath(), "utf8")
    const buildReport = JSON.parse(rawReport)["build"]
    return [buildReport["architecture"], buildReport["target"]]
  } catch (error) {
    console.error("[appsignal][ERROR] Unable to fetch install report:", error)
    return []
  }
}

try {
  mod = require("../build/Release/extension.node") as ExtensionWrapper
  mod.isLoaded = true
} catch (error) {
  mod = {
    isLoaded: false,
    extension: {
      start() {
        return
      },
      stop() {
        return
      },
      diagnoseRaw() {
        return
      },
      runningInContainer() {
        return
      },
      createOpenTelemetrySpan() {
        return
      },
      log() {
        return
      },
      logLoadingErrors() {
        const [installArch, installTarget] = fetchInstalledArch()
        const arch = process.arch
        const target = processTarget()

        if (
          installArch &&
          installTarget &&
          (arch !== installArch || target !== installTarget)
        ) {
          console.error(
            `[appsignal][ERROR] The AppSignal extension was installed for architecture '${installArch}-${installTarget}', but the current architecture is '${arch}-${target}'. Please reinstall the AppSignal package on the host the app is started.`
          )
        } else {
          console.error(
            "[appsignal][ERROR] AppSignal failed to load the extension. Please run the diagnose tool and email us at support@appsignal.com: https://docs.appsignal.com/nodejs/3.x/command-line/diagnose.html\n",
            error
          )
        }
      }
    }
  } as ExtensionWrapper
}

export = mod

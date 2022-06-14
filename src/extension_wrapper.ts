import fs from "fs"
import { installReportPath } from "./utils"

type ExtensionWrapper = {
  isLoaded: boolean
  extension: any
  span: any
  datamap: any
  dataarray: any
  metrics: any
}

let mod: ExtensionWrapper

function fetchInstalledArch(): [string, string] {
  try {
    const rawReport = fs.readFileSync(installReportPath(), "utf8")
    const buildReport = JSON.parse(rawReport)["build"]
    return [buildReport["architecture"], buildReport["target"]]
  } catch (error) {
    console.error("[appsignal][ERROR] Unable to fetch install report:", error)
    return ["unknown", "unknown"]
  }
}

try {
  mod = require("../build/Release/extension.node") as ExtensionWrapper
  mod.isLoaded = true
} catch (error) {
  const [installArch, installTarget] = fetchInstalledArch()
  const arch = process.arch,
    target = process.platform

  if (arch !== installArch || target !== installTarget) {
    console.error(
      `[appsignal][ERROR] The AppSignal extension was installed for architecture '${installArch}-${installTarget}', but the current architecture is '${arch}-${target}'. Please reinstall the AppSignal package on the host the app is started.`
    )
  } else {
    console.error(
      "[appsignal][ERROR] AppSignal failed to load the extension. Please run the diagnose tool and email us at support@appsignal.com: https://docs.appsignal.com/nodejs/command-line/diagnose.html\n",
      error
    )
  }

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
      importOpenTelemetrySpan() {
        return
      }
    }
  } as ExtensionWrapper
}

export = mod

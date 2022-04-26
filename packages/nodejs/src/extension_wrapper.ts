import { ExtensionWrapper } from "./interfaces/extension_wrapper"

let mod: ExtensionWrapper

try {
  mod = require("../build/Release/extension.node") as ExtensionWrapper
  mod.isLoaded = true
} catch (e) {
  console.error(
    "AppSignal extension not loaded. This could mean that your current " +
      "environment isn't supported, or that another error has occurred."
  )

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

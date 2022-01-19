import { ExtensionWrapper } from "./interfaces/extension_wrapper"

let mod: ExtensionWrapper

try {
  mod = require("../build/Release/extension.node") as ExtensionWrapper
  mod.isLoaded = true
} catch (e) {
  mod = {
    isLoaded: false,
    extension: {
      start() {
        throw new Error("Extension module not loaded")
      },
      stop() {},
      diagnoseRaw() {},
      runningInContainer() {}
    }
  } as ExtensionWrapper
}

export = mod

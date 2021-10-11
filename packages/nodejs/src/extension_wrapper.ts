import { ExtensionWrapper } from "./interfaces/extension_wrapper"

let mod: ExtensionWrapper

try {
  mod = require("@appsignal/nodejs-ext") as ExtensionWrapper
} catch (e) {
  mod = {
    extension: {
      start() {
        throw new Error("Extension module not loaded")
      },
      stop() {
        return
      }
    }
  } as ExtensionWrapper
}

export = mod

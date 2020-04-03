import { Extension } from "./interfaces/extension"

let mod: Extension

try {
  mod = require("@appsignal/nodejs-ext") as Extension
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
  } as Extension
}

export = mod

import shimmer from "shimmer"
import http from "http"

import { Tracer } from "../../tracer"
import { getPatchIncomingRequestFunction } from "../http/lifecycle/request"
import { Plugin } from "../../interfaces/plugin"

// quick alias to expose a type for the entire module
type HttpModule = typeof http

export const PLUGIN_NAME = "http"

export const instrument = (
  mod: HttpModule,
  tracer: Tracer
): Plugin<HttpModule> => ({
  version: ">= 10",
  install(): HttpModule {
    // wrap incoming requests
    if (mod?.Server?.prototype) {
      shimmer.wrap(
        mod.Server.prototype,
        "emit",
        getPatchIncomingRequestFunction(tracer)
      )
    }

    return mod
  },
  uninstall(): void {
    // unwrap incoming requests
    if (mod?.Server?.prototype) {
      shimmer.unwrap(mod.Server.prototype, "emit")
    }
  }
})

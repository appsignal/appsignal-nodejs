import shimmer from "shimmer"
import http from "http"

import { Tracer } from "../../tracer"
import { getPatchIncomingRequestFunction } from "../http/lifecycle/request"
import { Plugin } from "../../interfaces/plugin"

// quick patch to expose a type for the entire module
type HttpModule = typeof http

export const instrumentHttp = (
  mod: HttpModule,
  tracer: Tracer
): Plugin<HttpModule> => ({
  name: "http",
  version: process.versions.node,
  install(): HttpModule {
    if (mod?.Server?.prototype) {
      shimmer.wrap(
        mod.Server.prototype,
        "emit",
        getPatchIncomingRequestFunction(tracer)
      )
    }

    return mod
  },
  uninstall() {
    if (mod?.Server?.prototype) {
      shimmer.unwrap(mod.Server.prototype, "emit")
    }
  }
})

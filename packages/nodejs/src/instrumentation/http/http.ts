import shimmer from "shimmer"
import http from "http"

import { getPatchIncomingRequestFunction } from "./lifecycle/incoming"
import {
  getPatchOutgoingGetFunction,
  getPatchOutgoingRequestFunction
} from "./lifecycle/outgoing"

import { Tracer } from "../../interfaces/tracer"
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

    // wrap outgoing requests
    shimmer.wrap(mod, "request", getPatchOutgoingRequestFunction(tracer))
    shimmer.wrap(mod, "get", getPatchOutgoingGetFunction(mod.request))

    return mod
  },
  uninstall(): void {
    // unwrap incoming requests
    if (mod?.Server?.prototype) {
      shimmer.unwrap(mod.Server.prototype, "emit")
    }

    // unwrap outgoing requests
    shimmer.unwrap(mod, "request")
    shimmer.unwrap(mod, "get")
  }
})

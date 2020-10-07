import shimmer from "shimmer"
import https from "https"

import { getPatchIncomingRequestFunction } from "./lifecycle/incoming"
import {
  getPatchOutgoingGetFunction,
  getPatchOutgoingRequestFunction
} from "./lifecycle/outgoing"

import { Tracer } from "../../interfaces/tracer"
import { Plugin } from "../../interfaces/plugin"

// quick alias to expose a type for the entire module
type HttpsModule = typeof https

export const PLUGIN_NAME = "https"

export const instrument = (
  mod: HttpsModule,
  tracer: Tracer
): Plugin<HttpsModule> => ({
  version: ">= 10",
  install(): HttpsModule {
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

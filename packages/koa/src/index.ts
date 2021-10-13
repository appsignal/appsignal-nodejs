import shimmer from "shimmer"

import koa from "koa"
import type { Tracer, Plugin } from "@appsignal/nodejs"
import { getKoaUsePatch } from "./patches"

export const PLUGIN_NAME = "koa"

// quick alias to expose a type for the entire module
type KoaModule = typeof koa

export const instrument = (
  mod: KoaModule,
  tracer: Tracer
): Plugin<KoaModule> => ({
  version: ">= 2.0.0",
  install(): KoaModule {
    shimmer.wrap(mod.prototype, "use", getKoaUsePatch(tracer))
    return mod
  },
  uninstall(): void {
    shimmer.unwrap(mod.prototype, "use")
  }
})

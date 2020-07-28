import pg from "pg"
import { Tracer, Plugin } from "@appsignal/nodejs"

// quick alias to expose a type for the entire module
type PostgresModule = typeof pg

export const PLUGIN_NAME = "pg"

export const instrument = (
  mod: PostgresModule,
  tracer: Tracer
): Plugin<PostgresModule> => ({
  version: ">= 7.0.0",
  install(): PostgresModule {
    console.warn(
      "The @appsignal/pg package is deprecated as the pg package is now automatically instrumented by @appsignal/nodejs. The @appsignal/pg package is now a no-op. Please remove the package from your package.json, and any references to it in your code, to remove this message."
    )

    return mod
  },
  uninstall(): void {
    // this is a no-op
    return
  }
})

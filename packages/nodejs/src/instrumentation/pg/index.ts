import { Tracer } from "../../tracer"
import { Plugin } from "@appsignal/types"
import shimmer from "shimmer"
import pg from "pg"
import { EventEmitter } from "events"

import { patchCallback, patchPromise, patchSubmittable } from "./patches"

// quick alias to expose a type for the entire module
type PostgresModule = typeof pg

export const PLUGIN_NAME = "pg"

export const instrument = (
  mod: PostgresModule,
  tracer: Tracer
): Plugin<PostgresModule> => ({
  version: ">= 7.0.0",
  install(): PostgresModule {
    shimmer.wrap(mod.Client.prototype, "query", original => {
      return function wrapPgQuery(this: pg.Client, ...args: any[]) {
        const rootSpan = tracer.currentSpan()

        if (!rootSpan) {
          return original.apply(this, args as any)
        }

        const span = rootSpan.child()

        span.setCategory("sql.postgres").setName("Query")

        let returned: any

        if (args.length >= 1) {
          const queryObj = args[0]

          // extract query
          if (typeof queryObj === "object") {
            if (queryObj.text) {
              span.setSQL(queryObj.text)
            }
          } else if (typeof queryObj === "string") {
            span.setSQL(queryObj)
          }

          const callback = args[args.length - 1]

          // handle callback method signature
          if (typeof callback === "function") {
            args[args.length - 1] = patchCallback(tracer, span, callback)
          } else if (typeof args[0] === "object") {
            // handle callback method signature
            patchSubmittable(tracer, span, queryObj)
          }

          returned = original.apply(this, args as any)
        } else {
          returned = original.apply(this, args as any)
        }

        if (returned) {
          if (returned instanceof EventEmitter) {
            tracer.wrapEmitter(returned)
          } else if (typeof returned.then === "function") {
            returned = patchPromise(tracer, span, returned)
          }
        }

        return returned
      }
    })

    return mod
  },
  uninstall(): void {
    shimmer.unwrap(mod.Client.prototype, "query")
  }
})

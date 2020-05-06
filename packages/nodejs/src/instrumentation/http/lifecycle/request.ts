/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-async-hooks/src/AsyncHooksScopeManager.ts
 * Copyright 2019, OpenTelemetry Authors
 */

import { parse } from "url"
import { IncomingMessage, ServerResponse } from "http"

import { Tracer } from "../../../interfaces/tracer"

function incomingRequest(
  original: (event: string, ...args: unknown[]) => boolean,
  tracer: Tracer
) {
  return function (this: {}, event: string, ...args: unknown[]): boolean {
    if (event !== "request") {
      return original.apply(this, [event, ...args])
    }

    const [req, res] = args as [IncomingMessage, ServerResponse]
    const { method = "GET", url = "/" } = req
    const { pathname, query = {} } = parse(url, true)

    if (
      url &&
      /\.(css|js|jpg|jpeg|gif|png|svg|webp|json|ico|webmanifest)$/i.test(url)
    ) {
      return original.apply(this, [event, ...args])
    }

    const rootSpan = tracer
      .createSpan()
      .setName(`${method} ${pathname === "/" ? pathname : "[unknown route]"}`)
      .set("method", method)
      .setSampleData("params", query as {})

    return tracer.withSpan(rootSpan, span => {
      // calling this binds the event handlers to our current
      // async context
      tracer.wrapEmitter(req)
      tracer.wrapEmitter(res)

      const originalEnd = res.end

      // wraps the "end" event to close the span
      res.end = function (this: ServerResponse, ...args: unknown[]) {
        res.end = originalEnd

        const result = res.end.apply(this, [...args] as any)
        span.set("status_code", res.statusCode).close()

        return result
      }

      return original.apply(this, [event, ...args])
    })
  }
}

export function getPatchIncomingRequestFunction(tracer: Tracer) {
  return function (original: (event: string, ...args: unknown[]) => boolean) {
    return incomingRequest(original, tracer)
  }
}

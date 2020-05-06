/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-http/src/http.ts
 * Copyright 2019, OpenTelemetry Authors
 */

import { parse } from "url"
import { IncomingMessage, ServerResponse } from "http"

import { Tracer } from "../../../interfaces/tracer"

// explicitly ignore some urls that we can't guarantee groupings on, or
// routes that cause known issues.
// submit a pull request if you have any potential candidates for this array!
const DEFAULT_IGNORED_URLS = [
  // common static asset paths (with any query string)
  /\.(css|js|jpg|jpeg|gif|png|svg|webp|json|ico|webmanifest)((\?|\&)([^=]+)\=([^&]+))*$/i,
  // next.js hot reloading
  /(\/_next\/webpack-hmr)/i
]

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

    // don't start a span for ignored urls
    if (url && DEFAULT_IGNORED_URLS.some(el => el.test(url))) {
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

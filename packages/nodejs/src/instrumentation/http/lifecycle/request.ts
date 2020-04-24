/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-async-hooks/src/AsyncHooksScopeManager.ts
 * Copyright 2019, OpenTelemetry Authors
 */

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

    const [request, response] = args as [IncomingMessage, ServerResponse]
    const { method = "GET" } = request

    const rootSpan = tracer
      .createSpan()
      .setName(`${method} [unknown route]`)
      .set("method", method)

    return tracer.withSpan(rootSpan, span => {
      // calling this binds the event handlers to our current
      // async context
      tracer.wrapEmitter(request)
      tracer.wrapEmitter(response)

      const originalEnd = response.end

      // wraps the "end" event to close the span
      response.end = function (this: ServerResponse, ...args: unknown[]) {
        response.end = originalEnd

        const result = response.end.apply(this, [...args] as any)
        span.close()

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

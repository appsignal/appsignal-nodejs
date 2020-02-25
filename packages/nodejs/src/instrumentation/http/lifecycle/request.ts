import { IncomingMessage, ServerResponse } from "http"

import url from "url"
import { Tracer } from "../../../tracer"

function incomingRequest(
  original: (event: string, ...args: unknown[]) => boolean,
  tracer: Tracer
) {
  return function(this: {}, event: string, ...args: unknown[]): boolean {
    if (event !== "request") {
      return original.apply(this, [event, ...args])
    }

    const [request, response] = args as [IncomingMessage, ServerResponse]
    const { url: reqUrl = "/", method = "GET" } = request

    const rootSpan = tracer
      .createSpan(`${method} ${url.parse(reqUrl).pathname || "/"}`)
      .setNamespace("web")
      .set("method", method)

    return tracer.withSpan(rootSpan, span => {
      tracer.wrapEmitter(request)
      tracer.wrapEmitter(response)

      const originalEnd = response.end

      response.end = function(this: ServerResponse, ...args: unknown[]) {
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
  return function(original: (event: string, ...args: unknown[]) => boolean) {
    return incomingRequest(original, tracer)
  }
}

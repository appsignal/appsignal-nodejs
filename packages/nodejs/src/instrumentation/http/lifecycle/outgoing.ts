/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-http/src/http.ts
 * Copyright 2019, OpenTelemetry Authors
 */

import url from "url"
import { ClientRequest, RequestOptions } from "http"

import { NoopSpan } from "../../../noops"
import { Tracer } from "../../../interfaces/tracer"
import { Span } from "../../../interfaces/span"

const DEFAULT_IGNORED_URLS: RegExp[] = []

function outgoingRequestFunction(
  original: (...args: any[]) => ClientRequest,
  tracer: Tracer
): (...args: any[]) => ClientRequest {
  return function outgoingRequest(
    this: {},
    options: url.URL | RequestOptions | string,
    ...args: unknown[]
  ): ClientRequest {
    let span: Span

    // don't start a span for ignored urls
    // if (url && DEFAULT_IGNORED_URLS.some(el => el.test(url))) {
    //   return original.apply(this, [options, ...args])
    // }

    if (tracer.currentSpan() instanceof NoopSpan) {
      // create a new `RootSpan` if there isn't one already in progress
      span = tracer.createSpan()
    } else {
      span = tracer.currentSpan().child()
    }

    span
      .setName(`HTTP ${"/"}`)
      .setCategory("process_request.http")
      .set("method", "")

    return tracer.withSpan(span, () => {
      let req: ClientRequest

      try {
        req = original.apply(this, [options, ...args])
      } catch (err) {
        span.addError(err).close()
        throw err
      }

      tracer.wrapEmitter(req)

      req.on("response", res => {
        tracer.wrapEmitter(res)

        res.on("end", () => {
          span.close()
        })
      })

      req.on("close", () => {
        span.close()
      })

      req.on("error", (error: Error) => {
        span.addError(error).close()
      })

      return req
    })
  }
}

export function getPatchOutgoingGetFunction() {}

export function getPatchOutgoingRequestFunction(tracer: Tracer) {
  return (original: (...args: any[]) => ClientRequest) => {
    return outgoingRequestFunction(original, tracer)
  }
}

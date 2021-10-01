/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-plugin-http/src/http.ts
 * Copyright 2019, OpenTelemetry Authors
 */

import { Tracer, Span } from "../../../interfaces"
import url from "url"
import { IncomingMessage, ClientRequest, RequestOptions } from "http"

import { NoopSpan } from "../../../noops"

type HttpRequestArgs = Array<
  (
    res: IncomingMessage
  ) =>
    | void
    | undefined
    | ([RequestOptions, (res: IncomingMessage) => void | undefined] &
        ((res: IncomingMessage) => void))
>

// explicitly ignore some urls or routes that cause known issues.
// submit a pull request if you have any potential candidates for this array!
const DEFAULT_IGNORED_URLS = [
  // next.js telemetry
  /telemetry\.nextjs\.org/i
]

function optionsToOriginString(
  options: url.URL | RequestOptions | string
): string {
  let protocol: string = "http:"
  let hostname: string = "localhost"

  if (options instanceof url.URL) {
    return options.origin ?? `${protocol}//${hostname}`
  } else if (typeof options === "string") {
    const parsed = url.parse(options)
    protocol = parsed.protocol ?? protocol
    hostname = parsed.hostname ?? hostname
  } else {
    // is a `RequestOptions` object
    protocol = options.protocol ?? protocol
    hostname = options.hostname ?? hostname
  }

  return `${protocol}//${hostname}`
}

function optionsToMethodName(
  options: url.URL | RequestOptions | string
): string {
  if (
    // is a RequestOptions
    typeof options !== "string" &&
    !(options instanceof url.URL) &&
    options.method
  ) {
    return options.method ? options.method.toUpperCase() : "GET"
  } else {
    return "GET"
  }
}

function outgoingRequestFunction(
  original: (...args: any[]) => ClientRequest,
  tracer: Tracer
): (...args: any[]) => ClientRequest {
  return function outgoingRequest(
    this: {},
    urlOrOptions: string | url.URL | RequestOptions,
    ...args: unknown[]
  ): ClientRequest {
    let span: Span
    let origin: string
    let method: string

    if (args[0] && typeof args[0] !== "function") {
      // an options object may have been passed
      const otherOptions = args[0] as RequestOptions
      method = optionsToMethodName(otherOptions)
      origin = optionsToOriginString(otherOptions)
    } else {
      method = optionsToMethodName(urlOrOptions)
      origin = optionsToOriginString(urlOrOptions)
    }

    // don't start a span for ignored urls
    if (origin && DEFAULT_IGNORED_URLS.some(el => el.test(origin))) {
      return original.apply(this, [urlOrOptions, ...args])
    }

    if (tracer.currentSpan() instanceof NoopSpan) {
      // create a new `RootSpan` if there isn't one already in progress
      span = tracer.createSpan()
    } else {
      span = tracer.currentSpan().child()
    }

    span
      .setName(`${method} ${origin}`)
      .setCategory("request.http")
      .set("method", method)

    return tracer.withSpan(span, () => {
      let req: ClientRequest

      try {
        req = original.apply(this, [urlOrOptions, ...args])
      } catch (err) {
        tracer.setError(err)
        span.close()
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
        tracer.setError(error)
        span.close()
      })

      return req
    })
  }
}

export function getPatchOutgoingGetFunction(
  clientRequest: (
    options: RequestOptions | string | url.URL,
    ...args: HttpRequestArgs
  ) => ClientRequest
) {
  return (): ((...args: any[]) => ClientRequest) => {
    // it's important to note that the `clientRequest` function called below
    // is the patched version of `http.request` that we patched earlier
    return function outgoingGetRequest<
      T extends RequestOptions | string | url.URL
    >(this: never, options: T, ...args: HttpRequestArgs): ClientRequest {
      const req = clientRequest.apply(this, [options, ...args])
      req.end()
      return req
    }
  }
}

export function getPatchOutgoingRequestFunction(tracer: Tracer) {
  return (original: (...args: any[]) => ClientRequest) => {
    return outgoingRequestFunction(original, tracer)
  }
}

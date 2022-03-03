import { Client } from "@appsignal/nodejs"
import { HashMap } from "@appsignal/types"
import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  RequestHandler
} from "express"
import { IncomingHttpHeaders } from "http"

/**
 * Returns an Express middleware that can augment the current span
 * with data.
 */
export function expressMiddleware(appsignal: Client): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    const tracer = appsignal.tracer()
    const rootSpan = tracer.currentSpan()

    if (!rootSpan) {
      return next()
    }

    return tracer.withSpan(rootSpan, span => {
      const originalEnd = res.end

      tracer.wrapEmitter(req)
      tracer.wrapEmitter(res)

      // identifies the span in the stacked graphs
      span.setCategory("process_request.express")

      res.end = function (this: Response, ...args: any) {
        res.end = originalEnd

        const { method = "GET", params = {}, query = {}, headers } = req
        const filteredHeaders = filterHeaders(headers, appsignal)

        // if there is no error passed to `next()`, the span name will
        // be updated to match the current path
        if (req.route?.path) {
          // Prepend the namespace for middlewares
          const baseUrl = req.baseUrl || ""
          span.setName(`${method} ${baseUrl}${req.route.path}`)
        }

        // defeated the type checker here because i'm pretty sure the error
        // `tsc` returns is actually a parse error
        // @TODO: keep an eye on this
        // @ts-ignore
        span.setSampleData("params", { ...params, ...query })
        span.setSampleData("environment", filteredHeaders)

        return res.end.apply(this, args)
      }

      return next()
    })
  }
}

export function expressErrorHandler(appsignal: Client): ErrorRequestHandler {
  return function (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tracer = appsignal.tracer()
    const span = tracer.currentSpan()

    if (!span) {
      return next()
    }

    // if there's no `status` property, forward the error
    // we also ignore client errors here
    if (err && (!err.status || (err.status && err.status >= 500))) {
      tracer.setError(err)
    }

    return next(err)
  }
}

function filterHeaders(
  headers: IncomingHttpHeaders,
  appsignal: Client
): HashMap<any> {
  const filtered: HashMap<any> = {}
  const headersAllowList = appsignal.config.data.requestHeaders || []

  headersAllowList.forEach(key => {
    if (headers[key] != undefined) {
      filtered[key] = headers[key]
    }
  })

  return filtered
}

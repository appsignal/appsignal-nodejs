import { Appsignal } from "@appsignal/nodejs"

import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  RequestHandler
} from "express"

type ExpressMiddlewareOptions = {
  /**
   * Used to indicate if we should call span.setSampleData with
   * ExpressJS parsed params. If you're setting these manually,
   * pass false to prevent overriding your values.
   */
  recordParams?: boolean
}

/**
 * Returns an Express middleware that can augment the current span
 * with data.
 */
export function expressMiddleware(
  appsignal: Appsignal,
  { recordParams = false }: ExpressMiddlewareOptions = {}
): RequestHandler {
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

      res.end = function (this: Response) {
        res.end = originalEnd

        const { method = "GET", params = {}, query = {} } = req

        // if there is no error passed to `next()`, the span name will
        // be updated to match the current path
        if (req.route?.path) {
          span.setName(`${method} ${req.route.path}`)
        }

        if (recordParams) {
          // set route params (if parsed by express correctly)
          span.setSampleData("params", { ...params, ...query })
        }

        return res.end.apply(this, arguments as any)
      }

      return next()
    })
  }
}

export function expressErrorHandler(appsignal: Appsignal): ErrorRequestHandler {
  return function (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const span = appsignal.tracer().currentSpan()

    if (!span) {
      return next()
    }

    // if there's no `status` property, forward the error
    // we also ignore client errors here
    if (err && (!err.status || (err.status && err.status >= 500))) {
      span.addError(err)
    }

    return next(err)
  }
}

import { Appsignal } from "@appsignal/nodejs"

import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  RequestHandler
} from "express"

export function expressMiddleware(appsignal: Appsignal): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    const tracer = appsignal.tracer()
    const rootSpan = tracer.createSpan()

    if (!rootSpan) {
      return next()
    }

    if (req.params.password) {
      rootSpan.setSampleData("params", {
        ...req.params,
        password: "[FILTERED]"
      })
    } else {
      rootSpan.setSampleData("params", req.params)
    }

    return tracer.withSpan(rootSpan, span => {
      const originalEnd = res.end

      tracer.wrapEmitter(req)
      tracer.wrapEmitter(res)

      res.end = function (this: Response) {
        res.end = originalEnd

        const { method = "GET" } = req
        const returned = res.end.apply(this, arguments as any)

        // if there is no error passed to `next()`, the span name will
        // be updated to match the current path
        if (req.route?.path) {
          span.setName(`${method} ${req.route.path}`)
        }

        span.set("method", method).set("status_code", res.statusCode).close()

        return returned
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

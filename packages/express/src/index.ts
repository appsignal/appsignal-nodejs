import { Appsignal } from "@appsignal/nodejs"

import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
  RequestHandler
} from "express"

function expressMiddleware(appsignal: Appsignal): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    const span = appsignal.tracer().currentSpan()

    if (!span) {
      return next()
    }

    if (req.params.password) {
      span.setSampleData("params", {
        ...req.params,
        password: "[FILTERED]"
      })
    } else {
      span.setSampleData("params", req.params)
    }

    return next()
  }
}

function expressErrorHandler(appsignal: Appsignal): ErrorRequestHandler {
  return function(
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const span = appsignal.tracer().currentSpan()

    if (!span) {
      return next()
    }

    // if there's mo `status` property, forward the error
    // we also ignore client errors here
    if (err && (!err.status || (err.status && err.status >= 500))) {
      span.addError(err)
    }

    return next(err)
  }
}

module.exports = { expressMiddleware, expressErrorHandler }

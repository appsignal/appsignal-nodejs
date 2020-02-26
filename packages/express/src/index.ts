import { Appsignal } from "@appsignal/nodejs"
import { Request, Response, NextFunction, ErrorRequestHandler } from "express"

function expressMiddleware(appsignal: Appsignal): ErrorRequestHandler {
  return function(err: Error, req: Request, res: Response, next: NextFunction) {
    const span = appsignal.tracer().currentSpan()

    if (!span) {
      return next()
    }

    if (err) {
      span.addError(err)
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

module.exports = { expressMiddleware }

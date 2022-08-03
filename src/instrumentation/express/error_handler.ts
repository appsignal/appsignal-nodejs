import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import * as opentelemetry from "@opentelemetry/api"

export function expressErrorHandler(): ErrorRequestHandler {
  return function (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const activeSpan = opentelemetry.trace.getSpan(
      opentelemetry.context.active()
    )
    // if there's no `status` property, forward the error
    // we also ignore client errors here
    if (
      activeSpan &&
      err &&
      (!err.status || (err.status && err.status >= 500))
    ) {
      if (activeSpan) {
        activeSpan.recordException(err)
        activeSpan.setStatus({
          code: opentelemetry.SpanStatusCode.ERROR,
          message: err.message
        })
      }
    }
    return next(err)
  }
}

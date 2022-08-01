import { Client } from "../../client"
import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { SpanStatusCode } from "@opentelemetry/api"

export function expressErrorHandler(appsignal: Client): ErrorRequestHandler {
  return function (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const tracerProvider = appsignal.tracerProvider
    const expressTracer = tracerProvider.getTracer(
      "@opentelemetry/instrumentation-express@0.30.0:"
    )

    // if there's no `status` property, forward the error
    // we also ignore client errors here
    if (err && (!err.status || (err.status && err.status >= 500))) {
      const span = expressTracer.startSpan("expressError")
      span.recordException(err)
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: err.message
      })
      span.end()
    }

    return next(err)
  }
}

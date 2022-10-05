import { Request, Response, NextFunction, ErrorRequestHandler } from "express"
import { setError } from "../../helpers"

export function expressErrorHandler(): ErrorRequestHandler {
  return function (
    err: Error & { status?: number },
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    if (!err.status || err.status >= 500) {
      setError(err)
    }

    return next(err)
  }
}

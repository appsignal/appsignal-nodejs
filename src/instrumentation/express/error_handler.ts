import { NextFunction } from "express"
import { setError } from "../../helpers"

export function expressErrorHandler() {
  return function (
    err: Error & { status?: number },
    req: any,
    res: any,
    next: NextFunction
  ) {
    if (!err.status || err.status >= 500) {
      setError(err)
    }

    return next(err)
  }
}

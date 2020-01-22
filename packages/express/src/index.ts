import * as asyncHooks from "async_hooks"
import { Request, Response, NextFunction } from "express"

function expressMiddleware(appsignal: any) {
  return function(req: Request, res: Response, next: NextFunction) {
    const tracer = appsignal.tracer()
    const rootSpan = tracer.createSpan(`${req.method} ${req.url}`)

    rootSpan
      .setNamespace("web")
      .set("method", req.method)
      .setSampleData("params", {
        ...req.params,
        password: '[FILTERED]',
        password_confirmation: '[FILTERED]',
      })

    req.on("error", (err: Error) => rootSpan.addError(err))

    // HACK! super dirty, but gives the span a scope which is required for
    // the `ScopeManager` to recall it later (duh).
    // @TODO: needs a more permanent solution
    tracer._scopeManager._scopes.set(asyncHooks.executionAsyncId(), rootSpan)

    res.once("finish", () => {
      rootSpan.close()
    })

    return next()
  }
}

module.exports = { expressMiddleware }

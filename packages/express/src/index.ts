import * as asyncHooks from "async_hooks"
import { Appsignal } from "@appsignal/nodejs"
import { Request, Response, NextFunction, RequestHandler } from "express"

function expressMiddleware(appsignal: Appsignal): RequestHandler {
  return function(req: Request, res: Response, next: NextFunction) {
    const tracer = appsignal.tracer()
    const rootSpan = tracer.createSpan(`${req.method} ${req.url}`)

    rootSpan.setNamespace("web").set("method", req.method)

    if (req.params.password) {
      rootSpan.setSampleData("params", {
        ...req.params,
        password: "[FILTERED]"
      })
    } else {
      rootSpan.setSampleData("params", req.params)
    }

    req.on("error", (err: Error) => rootSpan.addError(err))

    // HACK! super dirty, but gives the span a scope which is required for
    // the `ScopeManager` to recall it later (duh).
    // @TODO: needs a more permanent solution
    ;(tracer as any)._scopeManager._scopes.set(
      asyncHooks.executionAsyncId(),
      rootSpan
    )

    res.once("finish", () => {
      rootSpan.close()
    })

    return next()
  }
}

module.exports = { expressMiddleware }

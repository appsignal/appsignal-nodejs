/**
 * Uses portions of `opentelemetry-js-contrib`
 * https://github.com/open-telemetry/opentelemetry-js-contrib/blob/master/plugins/node/opentelemetry-koa-instrumentation/src/koa.ts
 * Copyright 2019, OpenTelemetry Authors
 */

import type { Tracer } from "@appsignal/nodejs"
import koa, { Middleware, ParameterizedContext, DefaultState } from "koa"
import type { RouterParamContext } from "@koa/router"
import type * as Router from "@koa/router"

const kLayerPatched: unique symbol = Symbol("koa-layer-patched")

type KoaContext = ParameterizedContext<DefaultState, RouterParamContext>

type KoaMiddleware = Middleware<DefaultState, KoaContext> & {
  [kLayerPatched]?: boolean
  router?: Router
}

export function getKoaUsePatch(tracer: Tracer) {
  return function koaUsePatch(original: (middleware: KoaMiddleware) => koa) {
    return function use(this: koa, middlewareFunction: KoaMiddleware) {
      if (
        middlewareFunction.constructor.name == "GeneratorFunction" ||
        middlewareFunction.constructor.name == "AsyncGeneratorFunction"
      ) {
        return original.apply(this, [middlewareFunction])
      }

      let patchedFunction: KoaMiddleware

      if (middlewareFunction.router) {
        patchedFunction = patchRouterDispatch(tracer, middlewareFunction)
      } else {
        patchedFunction = patchLayer(tracer, middlewareFunction, {
          isRouter: false
        })
      }

      return original.apply(this, [patchedFunction])
    }
  }
}

/**
 * Patches the dispatch function used by @koa/router. This function
 * goes through each routed middleware and adds instrumentation via a call
 * to the @function patchLayer function.
 */
function patchRouterDispatch(
  tracer: Tracer,
  dispatchLayer: KoaMiddleware
): KoaMiddleware {
  const router = dispatchLayer.router
  const routesStack = router?.stack ?? []

  for (const pathLayer of routesStack) {
    const path = pathLayer.path
    const pathStack = pathLayer.stack

    for (let j = 0; j < pathStack.length; j++) {
      const routedMiddleware = pathStack[j]

      pathStack[j] = patchLayer(tracer, routedMiddleware, {
        isRouter: true,
        layerPath: path
      })
    }
  }

  return dispatchLayer
}

/**
 * Patches each individual @param middlewareLayer function in order to create the
 * span and propagate context.
 */
function patchLayer(
  tracer: Tracer,
  middlewareLayer: KoaMiddleware,
  {
    isRouter,
    layerPath
  }: {
    isRouter: boolean
    layerPath?: string
  }
): KoaMiddleware {
  if (middlewareLayer[kLayerPatched] === true) {
    return middlewareLayer
  }

  middlewareLayer[kLayerPatched] = true

  return async (context: KoaContext, next: koa.Next) => {
    const span = tracer.currentSpan()

    if (isRouter) {
      span.setName(`${context.method} ${layerPath}`)
    } else {
      span.setName(`${context.method} ${middlewareLayer.name || "/"}`)
    }

    return tracer.withSpan(span.child(), async child => {
      const result = await middlewareLayer(context, next)
      child.setCategory(`${isRouter ? "router" : "middleware"}.koa`).close()
      return result
    })
  }
}

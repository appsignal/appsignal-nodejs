/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-async-hooks/src/AsyncHooksScopeManager.ts
 * Copyright 2019, OpenTelemetry Authors
 *
 * Uses portions of `cloud-trace-nodejs`
 * https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/cls/async-hooks.ts
 * Copyright 2018, Google LLC
 */

import * as asyncHooks from "async_hooks"
import { EventEmitter } from "events"
import shimmer from "shimmer"

import { Func } from "./types/utils"
import { Span } from "./interfaces/span"

// A list of well-known EventEmitter methods that add event listeners.
const EVENT_EMITTER_METHODS: Array<keyof EventEmitter> = [
  "addListener",
  "on",
  "once",
  "prependListener",
  "prependOnceListener"
]

const WRAPPED = Symbol("@appsignal/nodejs:WRAPPED")

type ContextWrapped<T> = T & { [WRAPPED]?: boolean }

/**
 * Propagates specific scope between function calls and async operations.
 *
 * @class
 */
export class ScopeManager {
  private _scopes: Map<number, Span | undefined>
  private _asyncHook: asyncHooks.AsyncHook

  constructor() {
    this._scopes = new Map()

    const init = (id: number, type: string, triggerId: number) => {
      /**
       * We use the `executionAsyncId` here, as using the `triggerId` causes context
       * confusion in applications using async/await.
       */
      if (type === "PROMISE") {
        const currentId = asyncHooks.executionAsyncId()

        if (this._scopes.get(currentId)) {
          this._scopes.set(id, this._scopes.get(currentId))
        }
      } else {
        /**
         * `triggerId` usually equal the ID of the AsyncResource in whose scope we are
         * currently running (the "current" `AsyncResource`), or that of one
         * of its ancestors, so the behavior is not expected to be different
         * from using the ID of the current AsyncResource instead.
         *
         * However, as the `triggerId` can be defined in userland, we choose to respect th
         */
        if (this._scopes.get(triggerId)) {
          this._scopes.set(id, this._scopes.get(triggerId))
        }
      }
    }

    /**
     * When the `AsyncResource` is destroyed, we destroy the reference to the `Span`. The same
     * callback is called when a promise is resolved.
     */
    const destroy = (id: number) => {
      this._scopes.delete(id)
    }

    this._asyncHook = asyncHooks.createHook({
      init: init,
      destroy: destroy,
      promiseResolve: destroy
    })
  }

  /**
   * Enables the async hook.
   */
  public enable(): this {
    this._asyncHook.enable()
    return this
  }

  /**
   * Disables the async hook and clears the current `Spans`. Will generally
   * only need to be called by the test suite.
   */
  public disable(): this {
    this._asyncHook.disable()
    this._scopes = new Map()
    return this
  }

  /**
   * Returns the current active `Span`.
   */
  public active(): Span | undefined {
    const uid = asyncHooks.executionAsyncId()
    return this._scopes.get(uid) || undefined
  }

  /**
   * Executes a given function within the context of a given `Span`.
   */
  public withContext<T>(span: Span, fn: (s: Span) => T): T {
    const uid = asyncHooks.executionAsyncId()
    const oldScope = this._scopes.get(uid)

    this._scopes.set(uid, span)

    try {
      return fn(span)
    } catch (err) {
      span?.addError(err)
      throw err
    } finally {
      // revert to the previous span
      if (oldScope === undefined) {
        this._scopes.delete(uid)
      } else {
        this._scopes.set(uid, oldScope)
      }
    }
  }

  public bindContext<T>(fn: Func<T>): Func<T> {
    // return if we have already wrapped the function
    if ((fn as ContextWrapped<Func<T>>)[WRAPPED]) {
      return fn
    }

    // capture the context of the current `AsyncResource`
    const boundContext = this._scopes.get(asyncHooks.executionAsyncId())

    // return if there is no current context to bind
    if (!boundContext) {
      return fn
    }

    const self = this

    // wrap `fn` so that any AsyncResource objects that are created in `fn` will
    // share context with that of the `AsyncResource` with the given ID.
    const contextWrapper: ContextWrapped<Func<T>> = function(
      this: {},
      ...args: unknown[]
    ) {
      return self.withContext(boundContext, () => fn.apply(this, args))
    }

    // prevent re-wrapping
    contextWrapper[WRAPPED] = true

    // explicitly inherit the original function's length, because it is
    // otherwise zero-ed out
    Object.defineProperty(contextWrapper, "length", {
      enumerable: false,
      configurable: true,
      writable: false,
      value: fn.length
    })

    return contextWrapper
  }

  public emitWithContext(ee: EventEmitter): void {
    const that = this

    EVENT_EMITTER_METHODS.forEach(method => {
      if (ee[method]) {
        shimmer.wrap(ee, method, (oldFn: Func<any>) => {
          return function(this: {}, event: string, cb: Func<void>) {
            return oldFn.call(this, event, that.bindContext(cb))
          }
        })
      }
    })
  }
}

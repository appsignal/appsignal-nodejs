/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-async-hooks/src/AsyncHooksScopeManager.ts
 * Copyright 2019, OpenTelemetry Authors
 *
 * Uses portions of `cloud-trace-nodejs`
 * https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/cls/async-hooks.ts
 * Copyright 2018, Google LLC
 */

import { NodeSpan, Func } from "@appsignal/types"
import * as asyncHooks from "async_hooks"
import { EventEmitter } from "events"
import shimmer from "shimmer"

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
  #roots: Map<number, NodeSpan | undefined>
  #scopes: Map<number, NodeSpan | undefined>
  #asyncHook: asyncHooks.AsyncHook

  constructor() {
    this.#roots = new Map()
    this.#scopes = new Map()

    const init = (id: number, type: string, triggerId: number) => {
      /**
       * We use the `executionAsyncId` here, as using the `triggerId` causes context
       * confusion in applications using async/await.
       */
      if (type === "PROMISE") {
        const currentId = asyncHooks.executionAsyncId()

        if (this.#scopes.get(currentId)) {
          this.#scopes.set(id, this.#scopes.get(currentId))
          this.#roots.set(id, this.#roots.get(currentId))
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
        if (this.#scopes.get(triggerId)) {
          this.#scopes.set(id, this.#scopes.get(triggerId))
          this.#roots.set(id, this.#roots.get(triggerId))
        }
      }
    }

    /**
     * When the `AsyncResource` is destroyed, we destroy the reference to the `Span`. The same
     * callback is called when a promise is resolved.
     */
    const destroy = (id: number) => {
      this.#scopes.delete(id)
      this.#roots.delete(id)
    }

    this.#asyncHook = asyncHooks.createHook({
      init: init,
      destroy: destroy,
      promiseResolve: destroy
    })
  }

  /**
   * Enables the async hook.
   */
  public enable(): this {
    this.#asyncHook.enable()
    return this
  }

  /**
   * Disables the async hook and clears the current `Span`s. Will generally
   * only need to be called by the test suite.
   */
  public disable(): this {
    this.#asyncHook.disable()
    this.#scopes = new Map()
    return this
  }

  /**
   * Returns the current active `Span`.
   */
  public active(): NodeSpan | undefined {
    const uid = asyncHooks.executionAsyncId()
    return this.#scopes.get(uid)
  }

  /**
   * Sets the root `Span`
   */
  public setRoot(rootSpan: NodeSpan) {
    const uid = asyncHooks.executionAsyncId()
    this.#roots.set(uid, rootSpan)
  }

  /*
   * Returns the current root `Span`.
   */
  public root(): NodeSpan | undefined {
    const uid = asyncHooks.executionAsyncId()
    return this.#roots.get(uid)
  }

  /**
   * Executes a given function within the context of a given `Span`.
   */
  public withContext<T>(span: NodeSpan, fn: (s: NodeSpan) => T): T {
    const uid = asyncHooks.executionAsyncId()
    const oldScope = this.#scopes.get(uid)
    const rootSpan = this.#roots.get(uid)

    this.#scopes.set(uid, span)

    try {
      return fn(span)
    } catch (err) {
      rootSpan?.setError(err)
      throw err
    } finally {
      // revert to the previous span
      if (oldScope === undefined) {
        this.#scopes.delete(uid)
        this.#roots.delete(uid)
      } else {
        this.#scopes.set(uid, oldScope)
        this.#roots.set(uid, rootSpan)
      }
    }
  }

  public bindContext<T>(fn: Func<T>): Func<T> {
    // return if we have already wrapped the function
    if ((fn as ContextWrapped<Func<T>>)[WRAPPED]) {
      return fn
    }

    // capture the context of the current `AsyncResource`
    const boundContext = this.#scopes.get(asyncHooks.executionAsyncId())

    // return if there is no current context to bind
    if (!boundContext) {
      return fn
    }

    const self = this

    // wrap `fn` so that any AsyncResource objects that are created in `fn` will
    // share context with that of the `AsyncResource` with the given ID.
    const contextWrapper: ContextWrapped<Func<T>> = function (
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
          return function (this: {}, event: string, cb: Func<void>) {
            return oldFn.call(this, event, that.bindContext(cb))
          }
        })
      }
    })
  }
}

/**
 * Uses portions of `opentelemetry-js`
 * https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-scope-async-hooks/src/AsyncHooksScopeManager.ts
 * Copyright 2019, OpenTelemetry Authors
 *
 * Uses portions of `cloud-trace-nodejs`
 * https://github.com/googleapis/cloud-trace-nodejs/blob/master/src/cls/async-hooks.ts
 * Copyright 2018, Google LLC
 */

import { Func } from "@appsignal/types"
import { Span } from "./interfaces/span"
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
  #roots: Map<number, Span | undefined>
  #scopes: Map<number, Span | undefined>
  #asyncHook: asyncHooks.AsyncHook

  constructor() {
    this.#roots = new Map()
    this.#scopes = new Map()

    const init = (id: number, type: string, triggerId: number) => {
      // Move the current span and root over to the scopes and roots map for
      // the child executionAsyncId.
      const transferSpanScope = (
        list: Map<number, Span | undefined>,
        newId: number,
        oldId: number
      ) => {
        const span = list.get(oldId)
        if (span && span.open) {
          list.set(newId, list.get(oldId))
        }
      }

      /**
       * We use the `executionAsyncId` here, as using the `triggerId` causes context
       * confusion in applications using async/await.
       */
      if (type === "PROMISE") {
        const currentId = asyncHooks.executionAsyncId()

        transferSpanScope(this.#scopes, id, currentId)
        transferSpanScope(this.#roots, id, currentId)
      } else {
        /**
         * `triggerId` usually equal the ID of the AsyncResource in whose scope we are
         * currently running (the "current" `AsyncResource`), or that of one
         * of its ancestors, so the behavior is not expected to be different
         * from using the ID of the current AsyncResource instead.
         *
         * However, as the `triggerId` can be defined in userland, we choose to respect th
         */
        transferSpanScope(this.#scopes, id, triggerId)
        transferSpanScope(this.#roots, id, triggerId)
      }
    }

    /**
     * When the `AsyncResource` is destroyed, we destroy the reference to the `Span`. The same
     * callback is called when a promise is resolved.
     */
    const destroy = (id: number) => {
      this.removeSpanForUid(id)
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
  public active(): Span | undefined {
    const uid = asyncHooks.executionAsyncId()
    const span = this.#scopes.get(uid)
    // Perform check if the span is not closed. A span that has been closed
    // can't be considered an active span anymore.
    if (span && span.open) {
      // Span exists and is still open. These conditions make it a valid, still
      // active, span.
      return span
    } else {
      // Clear any reference to this span in the scopes manager to avoid
      // confusion next time the active span is fetched.
      this.removeSpanForUid(uid)
    }
  }

  /**
   * Sets the root `Span`
   */
  public setRoot(rootSpan: Span) {
    const uid = asyncHooks.executionAsyncId()
    this.#roots.set(uid, rootSpan)
    this.#scopes.set(uid, rootSpan)
  }

  /*
   * Returns the current root `Span`.
   */
  public root(): Span | undefined {
    const uid = asyncHooks.executionAsyncId()
    const span = this.#roots.get(uid)
    // Perform check if the span is not closed. A span that has been closed
    // can't be considered a root span anymore.
    if (span && span.open) {
      // Span exists and is still open. These conditions make it a valid, still
      // root, span.
      return span
    } else {
      // Clear any reference to this span in the scopes manager to avoid
      // confusion next time the root span is fetched.
      this.removeSpanForUid(uid)
    }
  }

  /*
   * Remove the Span for the given executionAsyncId from all scopes.
   */
  private removeSpanForUid(uid: number) {
    this.#scopes.delete(uid)
    this.#roots.delete(uid)
  }

  /**
   * Executes a given function within the context of a given `Span`.
   */
  public withContext<T>(span: Span, fn: (s: Span) => T): T {
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
        this.removeSpanForUid(uid)
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
    const boundContext = this.active()

    // return if there is no current context to bind
    if (!boundContext) {
      return fn
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this

    // wrap `fn` so that any AsyncResource objects that are created in `fn` will
    // share context with that of the `AsyncResource` with the given ID.
    const contextWrapper: ContextWrapped<Func<T>> = function (
      this: unknown,
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
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this

    EVENT_EMITTER_METHODS.forEach(method => {
      if (ee[method]) {
        shimmer.wrap(ee, method, (oldFn: Func<any>) => {
          return function (this: unknown, event: string, cb: Func<void>) {
            return oldFn.call(this, event, that.bindContext(cb))
          }
        })
      }
    })
  }
}

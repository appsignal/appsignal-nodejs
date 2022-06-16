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
import { NoopSpan } from "./noops/span"

// A list of well-known EventEmitter methods that add event listeners.
const EVENT_EMITTER_ADD_METHODS: Array<keyof EventEmitter> = [
  "addListener",
  "on",
  "once",
  "prependListener",
  "prependOnceListener"
]

// A list of well-known EventEmitter methods that remove event listeners.
const EVENT_EMITTER_REMOVE_METHODS: Array<keyof EventEmitter> = [
  "off",
  "removeListener"
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

  private setActive(span: Span) {
    if (span.open) {
      const uid = asyncHooks.executionAsyncId()
      this.#scopes.set(uid, span)
    }
  }

  /**
   * Unset any active span for the current executionAsyncId.
   */
  private unsetActive() {
    const uid = asyncHooks.executionAsyncId()
    this.#scopes.delete(uid)
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
    if (rootSpan.open) {
      const uid = asyncHooks.executionAsyncId()
      this.#roots.set(uid, rootSpan)
      this.#scopes.set(uid, rootSpan)
    }
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
    const oldScope = this.active()

    if (span.open) {
      this.setActive(span)
    } else {
      span = oldScope || new NoopSpan()
    }

    try {
      return fn(span)
    } catch (error) {
      if (error instanceof Error) this.root()?.setError(error)
      throw error
    } finally {
      // Unset the current active span so it doesn't leak outside this context
      // in case there was no previous active span or it's no longer open.
      this.unsetActive()
      if (oldScope) {
        // Revert the current active span
        this.setActive(oldScope)
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

    // explicitly inherit the original function's length and name
    Object.defineProperty(contextWrapper, "length", {
      configurable: true,
      value: fn.length
    })

    Object.defineProperty(contextWrapper, "name", {
      configurable: true,
      value: fn.name
    })

    return contextWrapper
  }

  public emitWithContext(ee: EventEmitter): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const thisScopeManager = this

    // For each event and callback that is registered with the event emitter,
    // `boundCallbacks` keeps a reference to the newly-created context-bound
    // callback that wraps around the original callback.
    // A listener with the same event and callback could be added from
    // different asynchronous contexts, meaning its context-bound wrapper
    // should bind it to a different scope, so it keeps a list of
    // context-bound callbacks for a single event and callback pair.
    const boundCallbacks = new BoundCallbacks()

    EVENT_EMITTER_ADD_METHODS.forEach(method => {
      if (ee[method]) {
        shimmer.wrap(ee, method, (oldFn: Func<any>) => {
          return function (this: unknown, event: string, cb: Func<void>) {
            const boundCallback = thisScopeManager.bindContext(cb)
            boundCallbacks.push(event, cb, boundCallback)
            return oldFn.call(this, event, boundCallback)
          }
        })
      }
    })

    EVENT_EMITTER_REMOVE_METHODS.forEach(method => {
      if (ee[method]) {
        shimmer.wrap(ee, method, (oldFn: Func<any>) => {
          return function (this: unknown, event: string, cb: Func<void>) {
            // If there is no bound callback for this event and callback, it
            // might be a listener that was added before the event emitter was
            // wrapped, so we should attempt to remove the given callback.
            const maybeBoundCallback = boundCallbacks.pop(event, cb) ?? cb
            return oldFn.call(this, event, maybeBoundCallback)
          }
        })
      }
    })
  }
}

class BoundCallbacks {
  #map: Map<string, WeakMap<Func<void>, Func<void>[]>>

  constructor() {
    this.#map = new Map()
  }

  push(event: string, cb: Func<void>, boundCallback: Func<void>): void {
    let eventMap = this.#map.get(event)
    if (!eventMap) {
      eventMap = new WeakMap()
      this.#map.set(event, eventMap)
    }

    let callbacks = eventMap.get(cb)
    if (!callbacks) {
      callbacks = []
      eventMap.set(cb, callbacks)
    }

    callbacks.push(boundCallback)
  }

  pop(event: string, cb: Func<void>): Func<void> | undefined {
    const eventMap = this.#map.get(event)
    if (!eventMap) return

    const callbacks = eventMap.get(cb)
    if (!callbacks) return

    return callbacks.pop()
  }
}

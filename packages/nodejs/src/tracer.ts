import { EventEmitter } from "events"

import { ScopeManager } from "./scope"
import { RootSpan, ChildSpan } from "./span"

import { Func } from "./types/utils"
import { Span } from "./interfaces/span"
import { Tracer as ITracer } from "./interfaces/tracer"

/**
 * The tracer object.
 *
 * @class
 */
export class Tracer implements ITracer {
  private _scopeManager: ScopeManager

  constructor() {
    this._scopeManager = new ScopeManager().enable()
  }

  /**
   * Creates a new `Span` instance.
   */
  public createSpan(name: string, span?: Span): Span {
    if (!span) {
      return new RootSpan(name)
    } else {
      const { traceId, spanId } = span
      return new ChildSpan(name, traceId, spanId)
    }
  }

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  public currentSpan(): Span | undefined {
    return this._scopeManager.active()
  }

  /**
   * Executes a given function within the context of a given `Span`. When the
   * function has finished executing, any value returned by the given function
   * is returned, but the `Span` remains active unless it is explicitly closed.
   *
   * The `Span` is passed as the single argument to the given function. This
   * allows you to create children of the `Span` for instrumenting nested
   * operations.
   *
   * The given function will be assumed to be either an async function, or a
   * function that returns a `Promise`. If a synchronous function (i.e. does
   * not return a `Promise`) is given, its returned value is wrapped in a
   * resolved `Promise`.
   */
  public withSpan<T>(span: Span, fn: (s: Span) => T): T {
    return this._scopeManager.withContext(span, fn)
  }

  /**
   * Wraps a given function in the current context.
   */
  public wrap<T>(fn: Func<T>): Func<T> {
    return this._scopeManager.bindContext(fn)
  }

  /**
   * Wraps an `EventEmitter` in the current context.
   */
  public wrapEmitter(emitter: EventEmitter): void {
    return this._scopeManager.emitWithContext(emitter)
  }
}

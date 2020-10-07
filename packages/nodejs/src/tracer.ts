import { EventEmitter } from "events"

import { ScopeManager } from "./scope"
import { RootSpan, ChildSpan } from "./span"
import { NoopSpan } from "./noops"

import { Func } from "./types/utils"
import { Tracer } from "./interfaces/tracer"
import { Span, SpanOptions } from "./interfaces/span"
import { SpanContext } from "./interfaces/context"

/**
 * The tracer object.
 *
 * @class
 */
export class BaseTracer implements Tracer {
  #scopeManager: ScopeManager

  constructor() {
    this.#scopeManager = new ScopeManager().enable()
  }

  /**
   * Creates a new `Span` instance. If a `Span` is passed as the optional second
   * argument, then the returned `Span` will be a `ChildSpan`.
   */
  public createSpan(options?: Partial<SpanOptions>, span?: Span): Span

  /**
   * Creates a new `Span` instance. If a `SpanContext` is passed as the optional second
   * argument, then the returned `Span` will be a `ChildSpan`.
   */
  public createSpan(options?: Partial<SpanOptions>, context?: SpanContext): Span

  /**
   * Creates a new `Span` instance.
   */
  public createSpan(
    options?: Partial<SpanOptions>,
    spanOrContext?: Span | SpanContext
  ): Span {
    if (!spanOrContext) {
      return new RootSpan(options)
    } else {
      return new ChildSpan(spanOrContext)
    }
  }

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  public currentSpan(): Span {
    return this.#scopeManager.active() || new NoopSpan()
  }

  /**
   * Executes a given function within the context of a given `Span`. When the
   * function has finished executing, any value returned by the given function
   * is returned, but the `Span` remains active unless it is explicitly closed.
   *
   * The `Span` is passed as the single argument to the given function. This
   * allows you to create children of the `Span` for instrumenting nested
   * operations.
   */
  public withSpan<T>(span: Span, fn: (s: Span) => T): T {
    return this.#scopeManager.withContext(span, fn)
  }

  /**
   * Wraps a given function in the current `Span`s scope.
   */
  public wrap<T>(fn: Func<T>): Func<T> {
    return this.#scopeManager.bindContext(fn)
  }

  /**
   * Wraps an `EventEmitter` in the current `Span`s scope.
   */
  public wrapEmitter(emitter: EventEmitter): void {
    return this.#scopeManager.emitWithContext(emitter)
  }
}

import {
  Tracer,
  NodeSpan,
  NodeSpanOptions,
  SpanContext,
  Func
} from "@appsignal/types"
import { EventEmitter } from "events"

import { ScopeManager } from "./scope"
import { RootSpan, ChildSpan } from "./span"
import { NoopSpan } from "./noops"

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
  public createSpan(
    options?: Partial<NodeSpanOptions>,
    span?: NodeSpan
  ): NodeSpan

  /**
   * Creates a new `Span` instance. If a `SpanContext` is passed as the optional second
   * argument, then the returned `Span` will be a `ChildSpan`.
   */
  public createSpan(
    options?: Partial<NodeSpanOptions>,
    context?: SpanContext
  ): NodeSpan

  /**
   * Creates a new `Span` instance.
   */
  public createSpan(
    options?: Partial<NodeSpanOptions>,
    spanOrContext?: NodeSpan | SpanContext
  ): NodeSpan {
    const activeRootSpan = this.rootSpan()

    if (spanOrContext) {
      return new ChildSpan(spanOrContext, options)
    } else if (activeRootSpan instanceof NoopSpan) {
      const rootSpan = new RootSpan(options)
      this.#scopeManager.setRoot(rootSpan)
      return rootSpan
    } else {
      return new ChildSpan(activeRootSpan, options)
    }
  }

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  public currentSpan(): NodeSpan {
    return this.#scopeManager.active() || new NoopSpan()
  }

  /*
   * Returns the root Span.
   *
   * If there is no root Span available, a NoopSpan is returned.
   */
  public rootSpan(): NodeSpan {
    return this.#scopeManager.root() || new NoopSpan()
  }

  /*
   * Adds the given error to the root Span.
   *
   * If there is no root Span available, a NoopSpan will be used instead,
   * and nothing will be tracked.
   */
  public setError(error: Error): NodeSpan | undefined {
    const activeRootSpan = this.rootSpan()

    activeRootSpan.setError(error)

    return activeRootSpan
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
  public withSpan<T>(span: NodeSpan, fn: (s: NodeSpan) => T): T {
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

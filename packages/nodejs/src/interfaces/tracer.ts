import { EventEmitter } from "events"
import { Span, SpanOptions, SpanContext } from "."
import { Func } from "@appsignal/types"

/**
 * The Tracer object contains various methods that you might use when creating
 * your own custom instrumentation. It is responsible for tracking the currently
 * active Span, and exposes functions for creating and activating new Spans.
 */
export interface Tracer {
  /**
   * Creates a new `Span` instance. If a `Span` is passed as the optional second
   * argument, then the returned `Span` will be a `ChildSpan`.
   */
  createSpan(options?: Partial<SpanOptions>, span?: Span): Span

  /**
   * Creates a new `Span` instance. If a `SpanContext` is passed as the optional second
   * argument, then the returned `Span` will be a `ChildSpan`.
   */
  createSpan(options?: Partial<SpanOptions>, context?: SpanContext): Span

  /**
   * Creates a new `Span` instance that is always the new RootSpan in the current
   * async context. If a previous RootSpan existed, it's ignored from this point on.
   * Make sure it's closed beforehand or handled by another part of the app.
   */
  createRootSpan(options?: Partial<SpanOptions>): Span

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  currentSpan(): Span

  /**
   *
   * Returns the root Span.
   *
   */
  rootSpan(): Span

  /**
   * Adds the given error to the root Span.
   *
   * If there is no root Span available to add the error, `undefined` is returned.
   */
  setError(error: Error): Span | undefined

  /**
   * Sends an error in a newly created `RootSpan` that will be closed after
   * the given error is added to it.
   *
   * The created `RootSpan` is passed as the single argument to the given function.
   * This allows you to add arbitrary metadata to it.
   */
  sendError<T>(error: Error, fn?: (s: Span) => T): void

  /**
   * Executes a given function asynchronously within the context of a given
   * `Span`. When the function has finished executing, any value returned by
   * the given function is returned, but the `Span` remains active unless it is
   * explicitly closed.
   *
   * The `Span` is passed as the single argument to the given function. This
   * allows you to create children of the `Span` for instrumenting nested
   * operations.
   */
  withSpan<T>(span: Span, fn: (s: Span) => T): T

  /**
   * Wraps a given function in the current `Span`s scope.
   */
  wrap<T>(fn: Func<T>): Func<T>

  /**
   * Wraps an `EventEmitter` in the current `Span`s scope.
   */
  wrapEmitter(emitter: EventEmitter): void
}

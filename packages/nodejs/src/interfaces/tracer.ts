import { Span } from "./span"

export interface Tracer {
  /**
   * Creates a new `Span` instance.
   */
  createSpan(namespace?: string, span?: Span): Span

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  currentSpan(): Span | undefined

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
}

import { ISpan } from "./ISpan"

export interface ITracer {
  /**
   * Creates a new `Span` instance.
   */
  createSpan(name: string, span?: ISpan): ISpan

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  currentSpan(): ISpan | undefined

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
  withSpan(
    span: ISpan,
    fn: (s: ISpan) => Promise<any> | any
  ): Promise<any> | any
}

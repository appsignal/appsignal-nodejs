import { HashMap } from "@appsignal/types"

export interface SpanOptions {
  namespace: string
  startTime: number
}

export interface Span {
  /**
   * The current ID of the trace.
   */
  traceId: string

  /**
   * The current ID of the Span.
   */
  spanId: string

  /**
   * Sets the name for a given Span. The Span name is used in the UI to group
   * like requests together.
   */
  setName(name: string): this

  /**
   * Sets the category for a given Span. The category groups Spans together
   * in the "Slow Events" feature, and in the "Sample breakdown".
   */
  setCategory(name: string): this

  /**
   * Sets arbitrary data on the current `Span`.
   */
  set(key: string, value: string | number | boolean): this

  /**
   * Returns a new `Span` object that is a child of the current `Span`.
   */
  child(): Span

  /**
   * Adds a given `Error` object to the current `Span`.
   */
  addError(error: Error): this

  /**
   * Sets a data collection as sample data on the current `Span`.
   */
  setSampleData(
    key: string,
    data: Array<string | number | boolean> | HashMap<string | number | boolean>
  ): this

  /**
   * Adds sanitized SQL data as a string to a Span.
   *
   * If called with a single argument, the `value` will be applied to the
   * span as the body, which will show the sanitized query in your dashboard.
   */
  setSQL(value: string): this

  /**
   * Completes the current `Span`.
   *
   * If an `endTime` is passed as an argument, the `Span` is closed with the
   */
  close(endTime?: number): this

  /**
   * Returns a JSON string representing the internal Span in the agent.
   */
  toJSON(): string
}

import { HashMap, HashMapValue } from "@appsignal/types"

/**
 * The state of a `Span` at initialization time.
 */
export interface SpanOptions {
  namespace?: string
  startTime?: number
}

/**
 * Represents all the information that identifies `Span` in the Trace and MUST be
 * propagated to child `Span`s and across process boundaries.
 */
export interface SpanContext {
  /**
   * The current ID of the trace.
   */
  traceId: string

  /**
   * The current ID of the Span.
   */
  spanId: string

  /**
   * The options for a trace.
   */
  traceFlags?: { sampled: boolean }

  /**
   * The tracing-system specific context.
   */
  traceState?: HashMap<string>
}

/**
 * A `Span` is the name of the object that we use to capture data about the
 * performance of your application, any errors and any surrounding context.
 * A `Span` can form a part of a broader trace, a hierarchical representation
 * of the flow of data through your application.
 */
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
   * Sets a given `Error` object to the current `Span`.
   */
  setError(error: Error): this

  /**
   * @deprecated since Node.js version 2.1.0
   * Use `setError` instead
   */
  addError(error: Error): this

  /**
   * Sets a data collection as sample data on the current `Span`.
   */
  setSampleData(
    key: string,
    data:
      | Array<
          HashMapValue | Array<HashMapValue> | HashMap<HashMapValue> | undefined
        >
      | HashMap<
          HashMapValue | Array<HashMapValue> | HashMap<HashMapValue> | undefined
        >
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
   * timestamp that you provide. `endTime` should be a numeric
   * timestamp in milliseconds since the UNIX epoch.
   */
  close(endTime?: number): this

  /**
   * Returns a SpanData object representing the internal Span in the extension.
   *
   * @private
   */
  toObject(): SpanData
}

/**
 * The internal data structure of a `Span` inside the AppSignal Extension.
 */
export type SpanData = {
  closed?: boolean
  name?: string
  namespace?: string
  parent_span_id?: string
  span_id?: string
  start_time?: number
  trace_id?: string
  error?: { name: string; message: string; backtrace: Array<String> }
  attributes?: { [key: string]: string }
}

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
   *
   */
  traceFlags?: { sampled: boolean }

  /**
   *
   */
  traceState?: { [key: string]: string }
}

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
   * Sets arbitrary data on the current `Span`.
   */
  set(key: string, value: string | number | boolean): this

  /**
   * Returns a new `Span` object that is a child of the current `Span`.
   */
  child(name: string): Span

  /**
   * Adds a given `Error` object to the current `Span`.
   */
  addError(error: Error): this

  /**
   * Sets a data collection as sample data on the current `Span`.
   */
  setSampleData(key: string, data: Array<any> | { [key: string]: any }): this

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

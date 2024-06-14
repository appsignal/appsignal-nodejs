import { span } from "./extension_wrapper"
import { Data } from "./internal/data"

export type SpanData = {
  closed?: boolean
  name?: string
  namespace?: string
  parent_span_id?: string
  span_id?: string
  start_time_seconds?: number
  start_time_nanoseconds?: number
  trace_id?: string
  error?: {
    name: string
    message: string
    backtrace_json: string
    backtrace: string[]
  }
  attributes?: { [key: string]: string }
}

export class Span {
  #ref: unknown

  constructor(ref: unknown) {
    this.#ref = ref
  }

  public close({ timestamp }: { timestamp?: [number, number] } = {}): this {
    if (timestamp !== undefined) {
      span.closeSpanWithTimestamp(this.#ref, timestamp[0], timestamp[1])
    } else {
      span.closeSpan(this.#ref)
    }
    return this
  }

  public setError(name: string, message: string, stackdata: string): this {
    const parsedStackdata = Data.generate(stackdata.split("\n"))

    span.addSpanError(this.#ref, name, message, parsedStackdata)
    return this
  }

  /**
   * Returns a SpanData object representing the internal Span in the extension.
   *
   * @private
   */
  public toObject(): SpanData {
    const json = span.spanToJSON(this.#ref)

    // If the span JSON is empty, the span has been closed.
    if (json.trim() === "") {
      return { closed: true }
    }

    return JSON.parse(json)
  }
}

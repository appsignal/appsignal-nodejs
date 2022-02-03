import { HashMap, HashMapValue } from "@appsignal/types"
import { Span, SpanOptions, SpanContext, SpanData } from "./interfaces"

import { span } from "./extension_wrapper"
import { Data } from "./internal/data"
import { getAgentTimestamps } from "./utils"
import { BaseClient } from "./client"

/**
 * The `Span` object represents a length of time in the flow of execution
 * in your application.
 *
 * This object should not be used directly - it should be used by creating
 * a `RootSpan` or `ChildSpan`.
 *
 * @class
 */
export class BaseSpan implements Span {
  protected _ref: unknown

  /**
   * The current ID of the trace.
   */
  public get traceId(): string {
    return span.getTraceId(this._ref)
  }

  /**
   * The current ID of the Span.
   */
  public get spanId(): string {
    return span.getSpanId(this._ref)
  }

  /**
   * The pointer to the span. This is used by the agent to locate the span
   * when passed by the extension.
   *
   * Note that although this property is public, it should not be accessed or
   * mutated.
   */
  public ref(): unknown {
    return this._ref
  }

  /**
   * Returns a new `Span` object that is a child of the current `Span`.
   */
  public child(options?: Partial<SpanOptions>): ChildSpan {
    return new ChildSpan(this, options)
  }

  /**
   * Sets arbitrary data on the current `Span`.
   */
  public set(key: string, value: string | number | boolean): this {
    if (typeof value === "string") {
      span.setSpanAttributeString(this._ref, key, value)
    }

    if (typeof value === "number") {
      if (Number.isInteger(value)) {
        span.setSpanAttributeInt(this._ref, key, value)
      } else {
        span.setSpanAttributeDouble(this._ref, key, value)
      }
    }

    if (typeof value === "boolean") {
      span.setSpanAttributeBool(this._ref, key, value)
    }

    return this
  }

  /**
   * Adds sanitized SQL data as a string to a Span.
   *
   * If called with a single argument, the `value` will be applied to the
   * span as the body, which will show the sanitized query in your dashboard.
   */
  public setSQL(value: string): this {
    if (!value) {
      return this
    }

    span.setSpanAttributeSqlString(this._ref, "appsignal:body", value)
    return this
  }

  /**
   * Sets the name for a given Span. The Span name is used in the UI to group
   * like requests together.
   */
  public setName(name: string): this {
    if (!name) return this
    span.setSpanName(this._ref, name)
    return this
  }

  /**
   * Sets the category for a given Span. The category groups Spans together
   * in the "Slow Events" feature, and in the "Sample breakdown".
   */
  public setCategory(category: string): this {
    if (typeof category !== "string") {
      return this
    }

    span.setSpanAttributeString(this._ref, "appsignal:category", category)
    return this
  }

  /**
   * Sets a data collection as sample data on the current `Span`.
   */
  public setSampleData(
    key: string,
    data:
      | Array<
          HashMapValue | Array<HashMapValue> | HashMap<HashMapValue> | undefined
        >
      | HashMap<
          HashMapValue | Array<HashMapValue> | HashMap<HashMapValue> | undefined
        >
  ): this {
    const clientConfig = BaseClient.config.data
    if (!key || !data) return this
    if (key == "params" && !clientConfig.sendParams) return this
    if (key == "session_data" && !clientConfig.sendSessionData) return this

    try {
      span.setSpanSampleData(this._ref, key, Data.generate(data))
    } catch (e) {
      console.error(
        `Error generating data (${e.name}: ${e.message}) for '${JSON.stringify(
          data
        )}'`
      )
    }

    return this
  }

  /**
   * Add a given `Error` object to the current `Span`.
   * Use `tracer.setError()` instead.
   *
   * @deprecated since Node.js version 2.1.0
   */
  public addError(error: Error): this {
    console.warn(
      "DEPRECATED: Please use the `tracer.setError` helper instead to set the error on the root span."
    )

    return this
  }

  /**
   * Set a given `Error` object to the current `Span`.
   * Use `tracer.setError()` instead.
   *
   * @deprecated since Node.js version 2.1.0
   */
  public setError(error: Error): this {
    console.warn(
      "DEPRECATED: Please use the `tracer.setError` helper instead to set the error on the root span."
    )

    return this
  }

  /**
   * Completes the current `Span`.
   *
   * If an `endTime` is passed as an argument, the `Span` is closed with the
   * timestamp that you provide. `endTime` should be a numeric
   * timestamp in milliseconds since the UNIX epoch.
   */
  public close(endTime?: number): this {
    if (endTime && typeof endTime === "number") {
      const { sec, nsec } = getAgentTimestamps(endTime)
      span.closeSpanWithTimestamp(this._ref, sec, nsec)
      return this
    } else {
      span.closeSpan(this._ref)
      return this
    }
  }

  /**
   * Returns a SpanData object representing the internal Span in the extension.
   *
   * @private
   */
  public toObject(): SpanData {
    const json = span.spanToJSON(this._ref)

    // if this is true, then the span has been garbage collected
    // @TODO: i feel that this could have better ergonomics on the agent
    // side. come up with something better here later.
    if (json.trim() === "") {
      return { closed: true }
    }

    return JSON.parse(json)
  }
}

/**
 * A `ChildSpan` is a descendent of a `RootSpan`. A `ChildSpan` can also
 * be a parent to many `ChildSpan`s.
 */
export class ChildSpan extends BaseSpan {
  constructor(span: Span, options?: Partial<SpanOptions>)

  constructor(context: SpanContext, options?: Partial<SpanOptions>)

  constructor(
    spanOrContext: Span | SpanContext,
    { startTime }: Partial<SpanOptions> = {}
  ) {
    super()

    if (spanOrContext instanceof BaseSpan) {
      if (startTime) {
        const { sec, nsec } = getAgentTimestamps(startTime)
        this._ref = span.createChildSpanWithTimestamp(
          spanOrContext.ref(),
          sec,
          nsec
        )
      } else {
        this._ref = span.createChildSpan(spanOrContext.ref())
      }
    } else {
      const { traceId, spanId } = spanOrContext
      this._ref = span.createSpanFromTraceparent(`00-${traceId}-${spanId}-00`)
    }
  }
}

/**
 * A `RootSpan` is the top-level `Span`, from which all `ChildSpan`s are
 * created from.
 */
export class RootSpan extends BaseSpan {
  constructor({ namespace = "web", startTime }: Partial<SpanOptions> = {}) {
    super()

    if (startTime) {
      const { sec, nsec } = getAgentTimestamps(startTime)
      this._ref = span.createRootSpanWithTimestamp(namespace, sec, nsec)
    } else {
      this._ref = span.createRootSpan(namespace)
    }
  }

  /*
   * Sets a given `Error` object to the current `RootSpan`.
   */
  public setError(error: Error): this {
    if (!error) return this

    const stackdata = Data.generate(
      error.stack ? error.stack.split("\n") : ["No stacktrace available."]
    )

    span.addSpanError(this._ref, error.name, error.message, stackdata)

    return this
  }
}

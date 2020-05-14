import { HashMap } from "@appsignal/types"

import { span } from "./extension"
import { DataArray, DataMap } from "./internal"
import { Span } from "./interfaces/span"

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
  protected _ref: any

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
   * Returns a new `Span` object that is a child of the current `Span`.
   */
  public child(): ChildSpan {
    return new ChildSpan(this.traceId, this.spanId)
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
  public setSQL(value: string): this

  public setSQL(key: string, value: string): this

  public setSQL(keyOrValue: string, value?: string): this {
    if (!keyOrValue) {
      return this
    }

    if (!value) {
      span.setSpanAttributeSqlString(this._ref, "appsignal:body", keyOrValue)
    } else {
      span.setSpanAttributeSqlString(this._ref, keyOrValue, value)
    }

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
    data: Array<string | number | boolean> | HashMap<string | number | boolean>
  ): this {
    if (!key || !data) return this

    try {
      span.setSpanSampleData(
        this._ref,
        key,
        Array.isArray(data) ? new DataArray(data).ref : new DataMap(data).ref
      )
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
   * Adds a given `Error` object to the current `Span`.
   */
  public addError(error: Error): this {
    if (!error) return this

    const stackdata = new DataArray(
      error.stack ? error.stack.split("\n") : ["No stacktrace available."]
    )

    span.addSpanError(this._ref, error.name, error.message, stackdata.ref)

    return this
  }

  /**
   * Completes the current `Span`.
   *
   * If an `endTime` is passed as an argument, the `Span` is closed with the
   */
  public close(endTime?: number): this {
    if (endTime) {
      return this
    }

    span.closeSpan(this._ref)

    return this
  }

  /**
   * Returns a JSON string representing the internal Span in the agent.
   */
  public toJSON(): string {
    return span.spanToJSON(this._ref)
  }
}

/**
 * A `ChildSpan` is a descendent of a `RootSpan`. A `ChildSpan` can also
 * be a parent to many `ChildSpan`s.
 */
export class ChildSpan extends BaseSpan {
  constructor(traceId: string, parentSpanId: string) {
    super()
    this._ref = span.createChildSpan(traceId, parentSpanId)
  }
}

/**
 * A `RootSpan` is the top-level `Span`, from which all `ChildSpan`s are
 * created from.
 */
export class RootSpan extends BaseSpan {
  constructor(namespace: string = "web") {
    super()
    this._ref = span.createRootSpan(namespace)
  }
}

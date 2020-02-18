// the C++ extension is loaded here (via commonjs for compatibility).
// we keep this as a locally scoped variable; the C++ bindings
// should not be visible publicly.
const { span } = require("../build/Release/extension.node")

import { DataArray, DataMap } from "./internal"
import { ISpan } from "./interfaces/ISpan"

/**
 * The `Span` object represents a length of time in the flow of execution
 * in your application.
 *
 * This object should not be used directly - it should be used by creating
 * a `RootSpan` or `ChildSpan`.
 *
 * @class
 */
export class Span implements ISpan {
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
   * Returns a new `Span` object that is a child of the current `Span`.
   */
  public child(name: string): ChildSpan {
    return new ChildSpan(name, this.traceId, this.spanId)
  }

  /**
   * Sets a namespace for the current `Span`. Namespaces allow grouping of `Span`s
   * by concern.
   *
   * By default AppSignal provides two namespaces: the "web" and "background" namespaces.
   *
   * The "web" namespace holds all data for HTTP requests while the "background" namespace
   * contains metrics from background job libraries and tasks.
   */
  public setNamespace(value: string): this {
    if (!value) return this
    span.setSpanNamespace(this._ref, value)
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
   * Sets a data collection as sample data on the current `Span`.
   */
  public setSampleData(
    key: string,
    data: Array<any> | { [key: string]: any }
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
export class ChildSpan extends Span {
  constructor(name: string, traceId: string, parentSpanId: string) {
    super()
    this._ref = span.createChildSpan(name, traceId, parentSpanId)
  }
}

/**
 * A `RootSpan` is the top-level `Span`, from which all `ChildSpan`s are
 * created from.
 */
export class RootSpan extends Span {
  constructor(name: string) {
    super()
    this._ref = span.createRootSpan(name)
  }
}

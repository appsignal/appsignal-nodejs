import { ScopeManager } from "./scope"
import { RootSpan, Span, ChildSpan } from "./span"
import { ISpan } from "./interfaces/ISpan"
import { ITracer } from "./interfaces/ITracer"

/**
 * The tracer object.
 *
 * @class
 */
export class Tracer implements ITracer {
  private _scopeManager: ScopeManager

  constructor() {
    this._scopeManager = new ScopeManager().enable()
  }

  /**
   * Creates a new `Span` instance.
   */
  public createSpan(name: string, span?: Span): Span | undefined {
    if (!span) {
      return new RootSpan(name)
    } else {
      const { traceId, spanId } = span
      return new ChildSpan(name, traceId, spanId)
    }
  }

  /**
   * Returns the current Span.
   *
   * If there is no current Span available, `undefined` is returned.
   */
  public currentSpan(): ISpan | undefined {
    return this._scopeManager.active()
  }

  /**
   * Executes a given function asynchronously within the context of a given
   * `Span`. When the function has finished executing, the `Span` is closed
   * and any value returned by the given function is returned.
   *
   * The `Span` is passed as the single argument to the given function. This
   * allows you to create children of the `Span` for instrumenting nested
   * operations.
   */
  public instrument(span: Span, fn: (s: Span) => any): Promise<any> {
    return this._scopeManager.with(span, fn, true)
  }

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
  public withSpan(span: Span, fn: (s: Span) => any): Promise<any> {
    return this._scopeManager.with(span, fn)
  }
}

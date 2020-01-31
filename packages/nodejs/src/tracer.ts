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
  public createSpan(name: string, span?: ISpan): ISpan {
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
   * Executes a given function within the context of a given `Span`. When the
   * function has finished executing, any value returned by the given function
   * is returned, but the `Span` remains active unless it is explicitly closed.
   *
   * The `Span` is passed as the single argument to the given function. This
   * allows you to create children of the `Span` for instrumenting nested
   * operations.
   *
   * The given function will be assumed to be either an async function, or a
   * function that returns a `Promise`. If a synchronous function (i.e. does
   * not return a `Promise`) is given, its returned value is wrapped in a
   * resolved `Promise`.
   */
  public withSpan(span: ISpan, fn: (s: ISpan) => Promise<any>): Promise<any> {
    return this._scopeManager.with(span, fn)
  }

  /**
   * Executes a given function within the context of a given `Span`. When the
   * function has finished executing, any value returned by the given function
   * is returned, but the `Span` remains active unless it is explicitly closed.
   *
   * The `Span` is passed as the single argument to the given function. This
   * allows you to create children of the `Span` for instrumenting nested
   * operations.
   *
   * The given function will be assumed to be a synchronous function that does not
   * return a `Promise`. If an asynchronous function, or a function that returns
   * a `Promise`, is given, then this may result in the `Span` ending early.
   */
  public withSpanSync(span: ISpan, fn: (s: ISpan) => any): any {
    return this._scopeManager.withSync(span, fn)
  }
}

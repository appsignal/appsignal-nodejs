import {
  NodeSpan,
  NodeSpanOptions,
  SpanContext,
  Tracer,
  Func
} from "@appsignal/types"
import { EventEmitter } from "events"

import { NoopSpan } from "./span"

export class NoopTracer implements Tracer {
  public createSpan(
    options?: Partial<NodeSpanOptions>,
    spanOrContext?: NodeSpan | SpanContext
  ): NodeSpan {
    return new NoopSpan()
  }

  public currentSpan(): NodeSpan {
    return new NoopSpan()
  }

  public rootSpan(): NodeSpan {
    return new NoopSpan()
  }

  public setError(error: Error): NodeSpan {
    return new NoopSpan()
  }

  public sendError<T>(error: Error, fn: (s: NodeSpan) => T): void {
    return
  }

  public withSpan<T>(span: NodeSpan, fn: (s: NodeSpan) => T): T {
    return fn(span)
  }

  public wrap<T>(fn: Func<T>): Func<T> {
    return fn
  }

  public wrapEmitter(emitter: EventEmitter): void {
    return
  }
}

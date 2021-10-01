import { Func } from "@appsignal/types"

import { Span, SpanOptions, SpanContext, Tracer } from "../interfaces"

import { EventEmitter } from "events"

import { NoopSpan } from "./span"

export class NoopTracer implements Tracer {
  public createSpan(
    options?: Partial<SpanOptions>,
    spanOrContext?: Span | SpanContext
  ): Span {
    return new NoopSpan()
  }

  public currentSpan(): Span {
    return new NoopSpan()
  }

  public rootSpan(): Span {
    return new NoopSpan()
  }

  public setError(error: Error): Span {
    return new NoopSpan()
  }

  public sendError<T>(error: Error, fn: (s: Span) => T): void {
    return
  }

  public withSpan<T>(span: Span, fn: (s: Span) => T): T {
    return fn(span)
  }

  public wrap<T>(fn: Func<T>): Func<T> {
    return fn
  }

  public wrapEmitter(emitter: EventEmitter): void {
    return
  }
}

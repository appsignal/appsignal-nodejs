import { Func } from "@appsignal/types"

import { Span, SpanOptions, SpanContext, Tracer } from "../interfaces"

import { EventEmitter } from "events"

import { NoopSpan } from "./span"

export class NoopTracer implements Tracer {
  public createSpan(
    _options?: Partial<SpanOptions>,
    _spanOrContext?: Span | SpanContext
  ): Span {
    return new NoopSpan()
  }

  public createRootSpan(_options?: Partial<SpanOptions>): Span {
    return new NoopSpan()
  }

  public currentSpan(): Span {
    return new NoopSpan()
  }

  public rootSpan(): Span {
    return new NoopSpan()
  }

  public setError(_error: Error): Span {
    return new NoopSpan()
  }

  public sendError<T>(_error: Error, _fn: (s: Span) => T): void {
    return
  }

  public withSpan<T>(span: Span, fn: (s: Span) => T): T {
    return fn(span)
  }

  public wrap<T>(fn: Func<T>): Func<T> {
    return fn
  }

  public wrapEmitter(_emitter: EventEmitter): void {
    return
  }
}

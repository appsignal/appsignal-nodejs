import { EventEmitter } from "events"

import { NoopSpan } from "./span"

import { Span, SpanOptions } from "../interfaces/span"
import { SpanContext } from "../interfaces/context"
import { Tracer } from "../interfaces/tracer"
import { Func } from "../types/utils"

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

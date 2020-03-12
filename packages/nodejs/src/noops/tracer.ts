import { EventEmitter } from "events"

import { NoopSpan } from "./span"
import { Span } from "../interfaces/span"
import { Tracer } from "../interfaces/tracer"
import { Func } from "../types/utils"

export class NoopTracer implements Tracer {
  public createSpan(namespace?: string, span?: Span): Span {
    return new NoopSpan()
  }

  public currentSpan(): Span | undefined {
    return
  }

  public withSpan<T>(span: Span, fn: (s: Span) => T): T {
    return {} as T
  }

  public wrap<T>(fn: Func<T>): Func<T> {
    return fn
  }

  public wrapEmitter(emitter: EventEmitter): void {
    return
  }
}

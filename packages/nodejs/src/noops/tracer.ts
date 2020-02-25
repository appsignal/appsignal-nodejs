import { NoopSpan } from "./span"
import { Span } from "../interfaces/span"
import { Tracer } from "../interfaces/tracer"

export class NoopTracer implements Tracer {
  public createSpan(name: string, span?: Span): Span {
    return new NoopSpan()
  }

  public currentSpan(): Span | undefined {
    return
  }

  public withSpan<T>(span: Span, fn: (s: Span) => T): T {
    return {} as T
  }
}

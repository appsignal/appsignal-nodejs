import { Span, SpanOptions, SpanContext } from "../src/interfaces"
import { RootSpan, ChildSpan } from "../src/span"

export class SpanTestRegistry {
  static spans: Span[] = []
  static closedSpans: Span[] = []

  static addSpan(span: Span) {
    this.spans.push(span)
  }

  static addClosedSpan(span: Span) {
    this.closedSpans.push(span)
  }

  static lastSpan(): Span {
    const length = this.spans.length
    return this.spans[length - 1]
  }

  static clear() {
    this.spans = []
    this.closedSpans = []
  }
}

jest.mock("../src/span", () => {
  const originalModule = jest.requireActual("../src/span")

  // Wrapper classes that registers each created Span classes on the
  // SpanTestRegistry so we can access the created spans later in the test.
  class TrackedRootSpan extends originalModule.RootSpan {
    constructor(spanOptions: Partial<SpanOptions> = {}) {
      super(spanOptions)
      SpanTestRegistry.addSpan((this as unknown) as Span)
    }

    // Mock out the `close` functions so that `Span.toObject` will return the
    // Span object from the extension. If `close` is called it will return an
    // empty object.
    // A list of closed Spans can be accessed with
    // `SpanTestRegistry.closedSpans`
    close() {
      SpanTestRegistry.addClosedSpan((this as unknown) as Span)
    }
  }

  class TrackedChildSpan extends originalModule.ChildSpan {
    constructor(
      spanOrContext: Span | SpanContext,
      spanOptions: Partial<SpanOptions> = {}
    ) {
      super(spanOrContext, spanOptions)
      SpanTestRegistry.addSpan((this as unknown) as Span)
    }

    // Mock out the `close` functions so that `Span.toObject` will return the
    // Span object from the extension. If `close` is called it will return an
    // empty object.
    // A list of closed Spans can be accessed with
    // `SpanTestRegistry.closedSpans`
    close() {
      SpanTestRegistry.addClosedSpan((this as unknown) as Span)
    }
  }

  return {
    ...originalModule,
    RootSpan: TrackedRootSpan,
    ChildSpan: TrackedChildSpan
  }
})

import { Span, SpanOptions, SpanContext } from "../src/interfaces"
import { RootSpan, ChildSpan } from "../src/span"

export class SpanTestRegistry {
  static spans: Span[] = []

  static addSpan(span: Span) {
    this.spans.push(span)
  }

  static lastSpan(): Span {
    const length = this.spans.length
    return this.spans[length - 1]
  }

  static clear() {
    this.spans = []
  }
}

jest.mock("../src/span", () => {
  const originalModule = jest.requireActual("../src/span")

  // Wrapper classes that registers each created Span classes on the
  // SpanTestRegistry so we can access the created spans later in the test.
  class TrackedRootSpan extends originalModule.RootSpan {
    protected _toObject: any = {}

    constructor(spanOptions: Partial<SpanOptions> = {}) {
      super(spanOptions)
      SpanTestRegistry.addSpan((this as unknown) as Span)
    }

    // Mock the `close` functions so that `Span.toObject` will return the
    // Span object from the extension as it was before it was closed.
    close() {
      this._toObject = super.toObject()
      return super.close()
    }

    toObject() {
      return { ...this._toObject, ...super.toObject() }
    }
  }

  class TrackedChildSpan extends originalModule.ChildSpan {
    protected _toObject: any = {}

    constructor(
      spanOrContext: Span | SpanContext,
      spanOptions: Partial<SpanOptions> = {}
    ) {
      super(spanOrContext, spanOptions)
      SpanTestRegistry.addSpan((this as unknown) as Span)
    }

    // Mock the `close` functions so that `Span.toObject` will return the
    // Span object from the extension as it was before it was closed.
    close() {
      this._toObject = super.toObject()
      return super.close()
    }

    toObject() {
      return { ...this._toObject, ...super.toObject() }
    }
  }

  return {
    ...originalModule,
    RootSpan: TrackedRootSpan,
    ChildSpan: TrackedChildSpan
  }
})

import type { Span } from "../src/span"

export class SpanTestRegistry {
  static spans: Span[] = []

  static addSpan(span: Span) {
    this.spans.push(span)
  }

  static lastSpan(): Span | undefined {
    return this.spans[this.count() - 1]
  }

  static count(): number {
    return this.spans.length
  }

  static clear() {
    this.spans = []
  }
}

jest.mock("../src/span", () => {
  const originalModule = jest.requireActual("../src/span")
  const OriginalSpan: typeof Span = originalModule.Span

  // Wrapper class that registers each created Span on the
  // SpanTestRegistry so we can access the created spans from the test.
  class TrackedSpan extends OriginalSpan {
    protected _toObject: any = {}

    constructor(ref: unknown) {
      super(ref)
      SpanTestRegistry.addSpan(this)
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
    Span: TrackedSpan
  }
})

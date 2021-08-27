import { Tracer } from "../tracer"
import { RootSpan, ChildSpan } from "../span"

describe("Tracer", () => {
  const name = "test"

  let tracer: Tracer

  beforeEach(() => {
    tracer = new Tracer()
  })

  describe(".createSpan()", () => {
    it("assigns the spans properly", () => {
      const rootSpan = tracer.createSpan().setName("rootSpan")
      const rootSpanData = JSON.parse(rootSpan.toJSON())

      expect(rootSpan).toBeInstanceOf(RootSpan)
      expect(rootSpanData.parent_span_id).toEqual("")
      expect(rootSpanData.name).toEqual("rootSpan")

      const childSpan = tracer.createSpan().setName("childSpan")
      const childSpanData = JSON.parse(childSpan.toJSON())

      expect(childSpan).toBeInstanceOf(ChildSpan)
      expect(childSpanData.parent_span_id).toEqual(rootSpanData.span_id)
      expect(childSpanData.name).toEqual("childSpan")

      const spanFromSpan = tracer.createSpan(undefined, childSpan).setName("spanFromSpan")
      const spanFromSpanData = JSON.parse(spanFromSpan.toJSON())

      expect(spanFromSpan).toBeInstanceOf(ChildSpan)
      expect(spanFromSpanData.parent_span_id).toEqual(childSpanData.span_id)
      expect(spanFromSpanData.name).toEqual("spanFromSpan")
    })
  })

  describe("Span instrumentation", () => {
    it("can instrument a function (async)", async done => {
      const rootSpan = tracer.createSpan().setName(name)

      await tracer.withSpan(rootSpan, async span => {
        const internal = JSON.parse(span.toJSON())
        expect(internal.name).toEqual(name)

        span.close()
      })

      return done()
    })
  })
})

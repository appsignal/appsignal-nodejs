import { BaseTracer as Tracer } from "../tracer"
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
      const rootSpanData = rootSpan.toObject()

      expect(rootSpan).toBeInstanceOf(RootSpan)
      expect(rootSpanData.parent_span_id).toEqual("")
      expect(rootSpanData.name).toEqual("rootSpan")

      const childSpan = tracer.createSpan().setName("childSpan")
      const childSpanData = childSpan.toObject()

      expect(childSpan).toBeInstanceOf(ChildSpan)
      expect(childSpanData.parent_span_id).toEqual(rootSpanData.span_id)
      expect(childSpanData.name).toEqual("childSpan")

      const spanFromSpan = tracer
        .createSpan(undefined, childSpan)
        .setName("spanFromSpan")
      const spanFromSpanData = spanFromSpan.toObject()

      expect(spanFromSpan).toBeInstanceOf(ChildSpan)
      expect(spanFromSpanData.parent_span_id).toEqual(childSpanData.span_id)
      expect(spanFromSpanData.name).toEqual("spanFromSpan")
    })
  })

  describe(".sendError()", () => {
    const err = new Error("FooBarError")

    it("works without metadata callback", () => {
      tracer.sendError(err)
    })

    it("uses a RootSpan", done => {
      tracer.sendError(err, rootSpan => {
        expect(rootSpan).toBeInstanceOf(RootSpan)

        return done()
      })
    })

    it("assigns metadata to the span if needed", done => {
      tracer.sendError(err, rootSpan => {
        rootSpan.setName("foo")
        rootSpan.setCategory("bar")
        rootSpan.set("pod", 42)

        const rootSpanData = rootSpan.toObject()

        expect(rootSpanData.name).toEqual("foo")
        expect(rootSpanData.attributes!["appsignal:category"]).toEqual("bar")
        expect(rootSpanData.attributes!.pod).toEqual(42)

        return done()
      })
    })

    it("adds the given error to the span", done => {
      tracer.sendError(err, rootSpan => {
        const rootSpanData = rootSpan.toObject()

        expect(rootSpanData.error!.message).toEqual("FooBarError")

        return done()
      })
    })
  })

  describe("Span instrumentation", () => {
    it("can instrument a function (async)", async done => {
      const rootSpan = tracer.createSpan().setName(name)

      await tracer.withSpan(rootSpan, async span => {
        const internal = span.toObject()
        expect(internal.name).toEqual(name)

        span.close()
      })

      return done()
    })
  })
})

import { BaseTracer as Tracer } from "../tracer"
import { RootSpan, ChildSpan } from "../span"
import { NoopSpan } from "../noops"

describe("Tracer", () => {
  const name = "test"

  let tracer: Tracer

  beforeEach(() => {
    tracer = new Tracer()
  })

  describe(".createSpan()", () => {
    describe("with no arguments", () => {
      it("creates a root span when there is no previous root span", () => {
        const rootSpan = tracer.createSpan().setName("rootSpan")
        const rootSpanData = rootSpan.toObject()

        expect(rootSpan).toBeInstanceOf(RootSpan)
        expect(rootSpanData.parent_span_id).toEqual("")
        expect(rootSpanData.name).toEqual("rootSpan")
      })

      it("creates a child span when a previous root span exists", () => {
        const rootSpan = tracer.createSpan().setName("rootSpan")
        const rootSpanData = rootSpan.toObject()

        const childSpan = tracer.createSpan().setName("childSpan")
        const childSpanData = childSpan.toObject()

        expect(childSpan).toBeInstanceOf(ChildSpan)
        expect(childSpanData.parent_span_id).toEqual(rootSpanData.span_id)
        expect(childSpanData.name).toEqual("childSpan")
      })
    })

    describe("from an existing span", () => {
      it("creates a child span of the given span", () => {
        // the root span is not created with `tracer.createSpan()`
        // so that the tracer doesn't already know about it
        const rootSpan = new RootSpan().setName("rootSpan")
        const rootSpanData = rootSpan.toObject()

        const childSpan = tracer
          .createSpan(undefined, rootSpan)
          .setName("childSpan")
        const childSpanData = childSpan.toObject()

        expect(childSpan).toBeInstanceOf(ChildSpan)
        expect(childSpanData.parent_span_id).toEqual(rootSpanData.span_id)
        expect(childSpanData.name).toEqual("childSpan")
      })
    })

    describe("from a NoopSpan", () => {
      it("behaves as if no span was passed", () => {
        const noopSpan = new NoopSpan()

        const rootSpan = tracer
          .createSpan(undefined, noopSpan)
          .setName("rootSpan")
        const rootSpanData = rootSpan.toObject()

        expect(rootSpan).toBeInstanceOf(RootSpan)
        expect(rootSpanData.parent_span_id).toEqual("")
        expect(rootSpanData.name).toEqual("rootSpan")

        const childSpan = tracer
          .createSpan(undefined, noopSpan)
          .setName("childSpan")
        const childSpanData = childSpan.toObject()

        expect(childSpan).toBeInstanceOf(ChildSpan)
        expect(childSpanData.parent_span_id).toEqual(rootSpanData.span_id)
        expect(childSpanData.name).toEqual("childSpan")
      })
    })
  })

  describe(".createRootSpan()", () => {
    it("creates a new span and assigns it as a root span", () => {
      const rootSpan1 = tracer.createRootSpan()
      expect(rootSpan1).toBeInstanceOf(RootSpan)
      expect(tracer.rootSpan()).toEqual(rootSpan1)
      expect(tracer.currentSpan()).toEqual(rootSpan1)
      rootSpan1.close()

      const rootSpan2 = tracer.createRootSpan()
      expect(rootSpan2).toBeInstanceOf(RootSpan)
      expect(tracer.rootSpan()).toEqual(rootSpan2)
      expect(tracer.currentSpan()).toEqual(rootSpan2)
      rootSpan2.close()
    })
  })

  describe(".sendError()", () => {
    const err = new Error("FooBarError")

    it("works without metadata callback", () => {
      expect(() => tracer.sendError(err)).not.toThrow()
    })

    it("uses a RootSpan", () => {
      const fn = jest.fn()

      tracer.sendError(err, fn)

      expect(fn).toBeCalledWith(expect.any(RootSpan))
    })

    it("assigns metadata to the span if needed", () => {
      const fn = jest.fn(rootSpan => {
        rootSpan.setName("foo")
        rootSpan.setCategory("bar")
        rootSpan.set("pod", 42)

        const rootSpanData = rootSpan.toObject()

        expect(rootSpanData.name).toEqual("foo")
        expect(rootSpanData.attributes?.["appsignal:category"]).toEqual("bar")
        expect(rootSpanData.attributes?.pod).toEqual(42)
      })

      tracer.sendError(err, fn)

      expect(fn).toBeCalled()
    })

    it("adds the given error to the span", () => {
      const fn = jest.fn(rootSpan => {
        const rootSpanData = rootSpan.toObject()

        expect(rootSpanData.error?.message).toEqual("FooBarError")
      })

      tracer.sendError(err, fn)

      expect(fn).toBeCalled()
    })
  })

  describe("Span instrumentation", () => {
    it("can instrument a function (async)", async () => {
      const rootSpan = tracer.createSpan().setName(name)

      await tracer.withSpan(rootSpan, async span => {
        const internal = span.toObject()
        expect(internal.name).toEqual(name)

        span.close()
      })
    })
  })
})

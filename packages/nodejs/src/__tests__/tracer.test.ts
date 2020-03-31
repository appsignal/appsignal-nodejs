import { Tracer } from "../tracer"
import { RootSpan } from "../span"

describe("Tracer", () => {
  const name = "test"

  let tracer: Tracer

  beforeEach(() => {
    tracer = new Tracer()
  })

  it("creates a RootSpan", () => {
    const span = tracer.createSpan().setName(name)
    const internal = JSON.parse(span.toJSON())

    expect(span).toBeInstanceOf(RootSpan)
    expect(internal.name).toEqual(name)
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

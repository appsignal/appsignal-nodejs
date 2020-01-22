import { Tracer } from "../tracer"
import { RootSpan } from "../span"

describe("Tracer", () => {
  let tracer: Tracer

  beforeEach(() => {
    tracer = new Tracer()
  })

  it("creates a RootSpan", () => {
    const name = "test"
    const span = tracer.createSpan(name)
    const internal = JSON.parse(span.toJSON())

    expect(span).toBeInstanceOf(RootSpan)
    expect(internal.name).toEqual(name)
  })

  it("can instrument a function", done => {
    const name = "test_instrumentation"

    const promise = tracer.instrument(tracer.createSpan(name), span => {
      const internal = JSON.parse(span.toJSON())
      expect(internal.name).toEqual(name)

      done()
    })

    expect(promise).resolves
  })
})

import { ChildSpan, RootSpan } from "../span"

type SpanData = {
  name: string
  namespace: string
  parent_span_id: string
  span_id: string
  start_time: number
  trace_id: string
}

describe("RootSpan", () => {
  let span: RootSpan
  let internal: SpanData

  beforeEach(() => {
    span = new RootSpan()
    internal = JSON.parse(span.toJSON())
  })

  it("creates a RootSpan", () => {
    expect(span).toBeInstanceOf(RootSpan)
  })

  it("exposes a spanId", () => {
    const { spanId } = span

    expect(spanId).toBeDefined()
    expect(internal.span_id).toBeDefined()
    expect(spanId).toEqual(internal.span_id)
  })

  it("exposes a traceId", () => {
    const { traceId } = span

    expect(traceId).toBeDefined()
    expect(internal.trace_id).toBeDefined()
    expect(traceId).toEqual(internal.trace_id)
  })

  it("creates a new ChildSpan", () => {
    const child = span.child()

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(ChildSpan)
  })

  it("belongs to a given namespace", () => {
    const ns = "test_namespace"

    span = new RootSpan(ns)
    internal = JSON.parse(span.toJSON())

    expect(internal.namespace).toEqual(ns)
  })

  it("sets the name", () => {
    const name = "test_span"

    span = new RootSpan().setName(name)
    internal = JSON.parse(span.toJSON())

    expect(internal.name).toEqual(name)
  })
})

describe("ChildSpan", () => {
  let span: ChildSpan
  let internal: SpanData

  beforeEach(() => {
    span = new ChildSpan("test_trace_id", "parent_span_id")
    internal = JSON.parse(span.toJSON())
  })

  it("creates a ChildSpan", () => {
    expect(span).toBeInstanceOf(ChildSpan)

    expect(internal.trace_id).toEqual("test_trace_id")
    expect(internal.parent_span_id).toEqual("parent_span_id")
  })

  it("exposes a spanId", () => {
    const { spanId } = span

    expect(spanId).toBeDefined()
    expect(internal.span_id).toBeDefined()
    expect(spanId).toEqual(internal.span_id)
  })

  it("exposes a traceId", () => {
    const { traceId } = span

    expect(traceId).toBeDefined()
    expect(internal.trace_id).toBeDefined()
    expect(traceId).toEqual(internal.trace_id)
  })

  it("creates a new ChildSpan", () => {
    const child = span.child()

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(ChildSpan)
  })

  it("sets the name", () => {
    const name = "test_span"

    span = new ChildSpan("test_trace_id", "parent_span_id").setName(name)
    internal = JSON.parse(span.toJSON())

    expect(internal.name).toEqual(name)
  })
})

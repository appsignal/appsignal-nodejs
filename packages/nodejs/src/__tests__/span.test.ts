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
    span = new RootSpan("test ☃")
    internal = JSON.parse(span.toJSON())
  })

  it("creates a RootSpan", () => {
    expect(span).toBeInstanceOf(RootSpan)
    expect(internal.name).toEqual("test ☃")
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
    const child = span.child("test_child")

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(ChildSpan)
  })

  it("belongs to a given namespace", () => {
    const ns = "test_namespace"
    span.setNamespace(ns)

    internal = JSON.parse(span.toJSON())
    expect(internal.namespace).toEqual(ns)
  })
})

describe("ChildSpan", () => {
  let span: ChildSpan
  let internal: SpanData

  beforeEach(() => {
    span = new ChildSpan("test", "test_trace_id", "parent_span_id")
    internal = JSON.parse(span.toJSON())
  })

  it("creates a ChildSpan", () => {
    expect(span).toBeInstanceOf(ChildSpan)

    expect(internal.name).toEqual("test")
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
    const child = span.child("test_child")

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(ChildSpan)
  })

  it("belongs to a given namespace", () => {
    const ns = "test_namespace"
    span.setNamespace(ns)

    internal = JSON.parse(span.toJSON())
    expect(internal.namespace).toEqual(ns)
  })
})

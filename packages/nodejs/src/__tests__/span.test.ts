import { ChildSpan, RootSpan } from "../span"

type SpanData = {
  closed: boolean
  name?: string
  namespace?: string
  parent_span_id?: string
  span_id?: string
  start_time?: number
  trace_id?: string
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
    expect(internal.closed).toBeFalsy()
  })

  it("creates a RootSpan with a timestamp", () => {
    const startTime = 1607022684531

    span = new RootSpan({ startTime })
    internal = JSON.parse(span.toJSON())

    expect(internal.start_time).toEqual(1607022685)
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

  it("exposes a start time", () => {
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
    const namespace = "test_namespace"

    span = new RootSpan({ namespace })
    internal = JSON.parse(span.toJSON())

    expect(internal.namespace).toEqual(namespace)
  })

  it("sets the name", () => {
    const name = "test_span"

    span = new RootSpan().setName(name)
    internal = JSON.parse(span.toJSON())

    expect(internal.name).toEqual(name)
  })

  it("closes a span", () => {
    span = new RootSpan().close()
    internal = JSON.parse(span.toJSON())

    expect(internal.closed).toBeTruthy()
  })
})

describe("ChildSpan", () => {
  let span: ChildSpan
  let internal: SpanData

  beforeEach(() => {
    span = new ChildSpan({ traceId: "aaaaaaaaaaaaaaaa", spanId: "bbbbbbbb" })
    internal = JSON.parse(span.toJSON())
  })

  it("creates a ChildSpan", () => {
    expect(span).toBeInstanceOf(ChildSpan)

    expect(internal.trace_id).toEqual("aaaaaaaaaaaaaaaa")
    expect(internal.parent_span_id).toEqual("bbbbbbbb")
    expect(internal.closed).toBeFalsy()
  })

  it("creates a ChildSpan with a timestamp", () => {
    const startTime = 1607022684531

    span = new ChildSpan(
      { traceId: "aaaaaaaaaaaaaaaa", spanId: "bbbbbbbb" },
      { startTime }
    )

    internal = JSON.parse(span.toJSON())

    expect(internal.trace_id).toEqual("aaaaaaaaaaaaaaaa")
    expect(internal.parent_span_id).toEqual("bbbbbbbb")
    // expect(internal.start_time).toEqual(1607022685)
    expect(internal.closed).toBeFalsy()
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

  it("exposes a start time", () => {
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

    span = new ChildSpan({
      traceId: "test_trace_id",
      spanId: "parent_span_id"
    }).setName(name)

    internal = JSON.parse(span.toJSON())

    expect(internal.name).toEqual(name)
  })

  it("closes a span", () => {
    span = new ChildSpan({
      traceId: "test_trace_id",
      spanId: "parent_span_id"
    }).close()

    internal = JSON.parse(span.toJSON())

    expect(internal.closed).toBeTruthy()
  })
})

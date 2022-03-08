import { ChildSpan, RootSpan } from "../span"
import { span } from "../extension_wrapper"
import { BaseClient } from "../client"
import { Data } from "../internal/data"
import { SpanData } from "../interfaces/span"

describe("RootSpan", () => {
  it("creates a RootSpan", () => {
    const span = new RootSpan()
    const internal = span.toObject()

    expect(span).toBeInstanceOf(RootSpan)
    expect(internal.closed).toBeFalsy()
  })

  it("creates a RootSpan with a timestamp", () => {
    const startTime = 1607022684531

    const span = new RootSpan({ startTime })
    const internal = span.toObject()

    expect(internal.start_time).toEqual(1607022685)
  })

  it("exposes a spanId", () => {
    const span = new RootSpan()
    const { spanId } = span
    const internal = span.toObject()

    expect(spanId).toBeDefined()
    expect(internal.span_id).toBeDefined()
    expect(spanId).toEqual(internal.span_id)
  })

  it("exposes a traceId", () => {
    const span = new RootSpan()
    const internal = span.toObject()
    const { traceId } = span

    expect(traceId).toBeDefined()
    expect(internal.trace_id).toBeDefined()
    expect(traceId).toEqual(internal.trace_id)
  })

  it("creates a new ChildSpan", () => {
    const span = new RootSpan()
    const child = span.child()

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(ChildSpan)
  })

  it("belongs to a given namespace", () => {
    const namespace = "test_namespace"

    const span = new RootSpan({ namespace })
    const internal = span.toObject()

    expect(internal.namespace).toEqual(namespace)
  })

  it("sets the name", () => {
    const name = "test_span"

    const span = new RootSpan().setName(name)
    const internal = span.toObject()

    expect(internal.name).toEqual(name)
  })

  it("sets the category", () => {
    const category = "test_category"

    const span = new RootSpan().setCategory(category)
    const internal = span.toObject()

    expect(internal.attributes?.["appsignal:category"]).toEqual(category)
  })

  it("sets attributes", () => {
    const span = new RootSpan()
    span.set("string", "hello world")
    span.set("boolean_true", true)
    span.set("boolean_false", false)
    span.set("int", 123)
    span.set("float", 123.45)
    const internal = span.toObject()

    expect(internal.attributes).toMatchObject({
      boolean_false: false,
      boolean_true: true,
      float: 123.45,
      int: 123,
      string: "hello world"
    })
  })

  it("sets an SQL query", () => {
    const query = "SELECT * FROM users WHERE email = 'test@test.com'"
    const sanitizedQuery = "SELECT * FROM users WHERE email = ?"

    const span = new RootSpan().setSQL(query)
    const internal = span.toObject()

    expect(internal.attributes?.["appsignal:body"]).toEqual(sanitizedQuery)
  })

  it("sets an error with backtrace", () => {
    const error = new Error("uh oh")
    const span = new RootSpan().setError(error)
    const internal = span.toObject()

    expect(internal.error).toEqual({
      name: "Error",
      message: "uh oh",
      backtrace: expect.any(String)
    })
    expect(internal.error?.backtrace).toMatch(/^\["Error: uh oh"/)
    expect(internal.error?.backtrace).toMatch(/span\.test\.ts/)
  })

  it("sets an error without backtrace", () => {
    const error = new Error("uh oh")
    error.stack = undefined
    const span = new RootSpan().setError(error)
    const internal = span.toObject()

    expect(internal.error).toEqual({
      name: "Error",
      message: "uh oh",
      backtrace: '["No stacktrace available."]'
    })
  })

  it("closes a span", () => {
    const span = new RootSpan().close()
    const internal = span.toObject()

    expect(internal.closed).toBeTruthy()
  })
})

describe("ChildSpan", () => {
  let span: ChildSpan
  let internal: SpanData

  beforeEach(() => {
    span = new ChildSpan({ traceId: "aaaaaaaaaaaaaaaa", spanId: "bbbbbbbb" })
    internal = span.toObject()
  })

  it("creates a ChildSpan without a timestamp", () => {
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
    internal = span.toObject()

    expect(internal.trace_id).toEqual("aaaaaaaaaaaaaaaa")
    expect(internal.parent_span_id).toEqual("bbbbbbbb")
    // TODO: Fix
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

  it("creates a new ChildSpan", () => {
    const child = span.child()

    expect(child).toBeDefined()
    expect(child).toBeInstanceOf(ChildSpan)
  })

  it("sets the category", () => {
    const category = "test_category"

    span = new ChildSpan({
      traceId: "test_trace_id",
      spanId: "parent_span_id"
    }).setCategory(category)
    internal = span.toObject()

    expect(internal.attributes?.["appsignal:category"]).toEqual(category)
  })

  it("closes a span", () => {
    span = new ChildSpan({
      traceId: "test_trace_id",
      spanId: "parent_span_id"
    }).close()
    internal = span.toObject()

    expect(internal.closed).toBeTruthy()
  })
})

describe(".setSampleData()", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"
  const DEFAULT_OPTS = { name, pushApiKey, enableMinutelyProbes: false }
  const sampleData = { foo: "bar" }

  it("calls the extension with the desired params data if sendParams is active", () => {
    new BaseClient({ ...DEFAULT_OPTS })

    const rootSpan = new RootSpan()
    const spanMock = jest
      .spyOn(span, "setSpanSampleData")
      .mockImplementation(() => {})

    rootSpan.setSampleData("params", sampleData)

    expect(spanMock).toHaveBeenCalledWith(
      {},
      "params",
      Data.generate(sampleData)
    )
  })

  it("does not call the extension with the desired params data if sendParams is inactive", () => {
    new BaseClient({ ...DEFAULT_OPTS, sendParams: false })

    const rootSpan = new RootSpan()
    const spanMock = jest
      .spyOn(span, "setSpanSampleData")
      .mockImplementation(() => {})

    rootSpan.setSampleData("params", sampleData)

    expect(spanMock).not.toHaveBeenCalled()
  })

  it("calls the extension with the desired session data if sendSessionData is active", () => {
    new BaseClient({ ...DEFAULT_OPTS })

    const rootSpan = new RootSpan()
    const spanMock = jest
      .spyOn(span, "setSpanSampleData")
      .mockImplementation(() => {})

    rootSpan.setSampleData("session_data", sampleData)

    expect(spanMock).toHaveBeenCalledWith(
      {},
      "session_data",
      Data.generate(sampleData)
    )
  })

  it("does not call the extension with the desired session data if sendSessionData is inactive", () => {
    new BaseClient({ ...DEFAULT_OPTS, sendSessionData: false })

    const rootSpan = new RootSpan()
    const spanMock = jest.spyOn(span, "setSpanSampleData")

    rootSpan.setSampleData("session_data", sampleData)

    expect(spanMock).not.toHaveBeenCalled()
  })
})

import { SpanTestRegistry } from "../../test/registry"
import { Client } from "../client"
import { SpanProcessor } from "../span_processor"
import { Tracer, BasicTracerProvider } from "@opentelemetry/sdk-trace-base"
import { trace, context } from "@opentelemetry/api"

describe("Span processor", () => {
  let tracer: Tracer
  let tracerProvider: BasicTracerProvider
  let client: Client

  function createError(message: string): any {
    try {
      throw new Error(message)
    } catch (e) {
      return e
    }
  }

  beforeEach(() => {
    SpanTestRegistry.clear()

    client = new Client({
      name: "TEST APP",
      pushApiKey: "PUSH_API_KEY",
      active: true,
      enableMinutelyProbes: false
    })

    const spanProcessor = new SpanProcessor(client)

    tracerProvider = new BasicTracerProvider()
    tracerProvider.addSpanProcessor(spanProcessor)

    tracer = tracerProvider.getTracer("unknown-instrumentation")
  })

  afterEach(() => {
    tracerProvider.shutdown()
    client.stop()
  })

  it("processes unknown OpenTelemetry spans", () => {
    tracer.startSpan("unknownSpan").setAttribute("foo", "bar").end()

    expect(SpanTestRegistry.count()).toEqual(1)
    expect(SpanTestRegistry.lastSpan()?.toObject()).toMatchObject({
      name: "unknownSpan",
      closed: true,
      attributes: expect.objectContaining({
        foo: "bar",
        "appsignal:body": expect.stringContaining("unknown-instrumentation")
      }),
      parent_span_id: "",
      error: null
    })
  })

  it("processes an exception event in an OpenTelemetry span as the error", () => {
    const span = tracer.startSpan("errorSpan")
    span.recordException(createError("first"))
    span.end()

    expect(SpanTestRegistry.count()).toEqual(1)
    expect(SpanTestRegistry.lastSpan()?.toObject()).toMatchObject({
      name: "errorSpan",
      closed: true,
      parent_span_id: "",
      error: {
        name: "Error",
        message: "first",
        backtrace: expect.any(String)
      }
    })

    const backtrace = JSON.parse(
      SpanTestRegistry.lastSpan()?.toObject()?.error?.backtrace ?? ""
    )
    expect(backtrace).toBeInstanceOf(Array)

    expect(backtrace[0]).toEqual("Error: first")
    expect(backtrace[1]).toMatch(/^\s+at createError \(/)
  })

  it("ignores exception events in child spans", () => {
    const parentSpan = tracer.startSpan("parentSpan")

    const ctx = trace.setSpan(context.active(), parentSpan)
    context.with(ctx, () => {
      const childSpan = tracer.startSpan("childSpan")
      childSpan.recordException(createError("ignored"))
      childSpan.end()
    })

    parentSpan.end()

    expect(SpanTestRegistry.count()).toEqual(2)
    const spans = SpanTestRegistry.spans.map(span => span.toObject())
    expect(spans).toContainEqual(
      expect.objectContaining({
        name: "parentSpan",
        closed: true,
        parent_span_id: "",
        trace_id: expect.stringMatching(/./),
        error: null
      })
    )

    const createdParentSpan = spans.find(span => span.name == "parentSpan")
    expect(createdParentSpan).toBeDefined()

    expect(spans).toContainEqual(
      expect.objectContaining({
        name: "childSpan",
        closed: true,
        parent_span_id: createdParentSpan?.span_id,
        trace_id: createdParentSpan?.trace_id,
        error: null
      })
    )
  })
})

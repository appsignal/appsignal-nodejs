import { NodeSDK } from "@opentelemetry/sdk-node"
import { ReadableSpan, SpanProcessor } from "@opentelemetry/sdk-trace-base"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"

import {
  setBody,
  setCategory,
  setCustomData,
  setHeader,
  setName,
  setParams,
  setSessionData,
  setTag,
  setNamespace
} from "../helpers"

describe("Helpers", () => {
  let spans: ReadableSpan[] = []
  let sdk: NodeSDK
  let tracerProvider: NodeTracerProvider

  const spanProcessor: SpanProcessor = {
    onEnd(span) {
      spans.push(span)
    },

    shutdown() {
      return Promise.resolve()
    },
    forceFlush() {
      return Promise.resolve()
    },
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onStart(_span, _context) {}
  }

  beforeAll(() => {
    sdk = new NodeSDK({
      instrumentations: []
    })

    sdk.start()

    tracerProvider = new NodeTracerProvider()
    tracerProvider.addSpanProcessor(spanProcessor)
    tracerProvider.register()
  })

  beforeEach(() => {
    spans = []
  })

  afterAll(() => {
    sdk.shutdown()
  })

  it("set the attributes", () => {
    tracerProvider.getTracer("test").startActiveSpan("Some span", span => {
      setBody("SELECT * FROM users")
      setCategory("some.query")
      setName("Some query")
      setCustomData({ chunky: "bacon" })
      setParams({ id: 123 })
      setSessionData({ admin: true })
      setHeader("content-type", "application/json")
      setTag("something", true)
      setNamespace("web")

      span.end()
    })

    expect(spans.length).toEqual(1)
    expect(spans[0].attributes).toMatchObject({
      "appsignal.body": "SELECT * FROM users",
      "appsignal.category": "some.query",
      "appsignal.name": "Some query",
      "appsignal.custom_data": '{"chunky":"bacon"}',
      "appsignal.request.parameters": '{"id":123}',
      "appsignal.request.session_data": '{"admin":true}',
      "appsignal.request.headers.content-type": "application/json",
      "appsignal.tag.something": true,
      "appsignal.namespace": "web"
    })
  })
})

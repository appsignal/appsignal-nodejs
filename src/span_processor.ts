import * as fs from "fs"
import type { Context } from "@opentelemetry/api"
import { context, SpanKind } from "@opentelemetry/api"
import type {
  Span,
  ReadableSpan,
  SpanProcessor as OpenTelemetrySpanProcessor
} from "@opentelemetry/sdk-trace-base"
import { suppressTracing } from "@opentelemetry/core"
import { Client } from "./client"

export class SpanProcessor implements OpenTelemetrySpanProcessor {
  client: Client

  constructor(client: Client) {
    this.client = client
  }

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStart(_span: Span, _parentContext: Context): void {}

  onEnd(span: ReadableSpan): void {
    // Add OpenTelemetry kind enum value as a magic attribute
    const spanAttributes = {
      ...span.attributes,
      "appsignal.kind": SpanKind[span.kind]
    }

    const opentelemetrySpan = this.client.extension.createOpenTelemetrySpan(
      span.spanContext().spanId,
      span.parentSpanId || "",
      span.spanContext().traceId,
      span.startTime[0],
      span.startTime[1],
      span.endTime[0],
      span.endTime[1],
      span.name,
      spanAttributes,
      span.instrumentationLibrary.name
    )

    const errors = span.events.filter(event => event.name == "exception")
    errors.forEach(e => {
      const eventAttributes = e["attributes"] as any

      opentelemetrySpan.setError(
        eventAttributes["exception.type"],
        eventAttributes["exception.message"],
        eventAttributes["exception.stacktrace"]
      )
    })

    opentelemetrySpan.close()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

export class TestModeSpanProcessor implements OpenTelemetrySpanProcessor {
  #filePath: string

  constructor(testModeFilePath: string) {
    this.#filePath = testModeFilePath
  }

  forceFlush() {
    return Promise.resolve()
  }

  onStart(_span: any, _parentContext: any) {
    // Does nothing
  }

  onEnd(span: any) {
    // must grab specific attributes only because
    // the span is a circular object
    const serializableSpan = {
      attributes: span.attributes,
      events: span.events,
      status: span.status,
      name: span.name,
      spanId: span._spanContext.spanId,
      traceId: span._spanContext.traceId,
      parentSpanId: span.parentSpanId,
      instrumentationLibrary: span.instrumentationLibrary,
      startTime: span.startTime,
      endTime: span.endTime
    }

    // As `fs` is an automatically instrumented module by default, we supress tracing during
    // its usage here so it doesn't fail nor contaminate actual traces.
    context.with(suppressTracing(context.active()), () => {
      // Re-open the file for every write, as the test process might have
      // truncated it in between writes.
      const file = fs.openSync(this.#filePath, "a")
      fs.appendFileSync(file, `${JSON.stringify(serializableSpan)}\n`)
      fs.closeSync(file)
    })
  }

  shutdown() {
    return Promise.resolve()
  }
}

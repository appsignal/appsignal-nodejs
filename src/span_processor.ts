import { Context } from "@opentelemetry/api"

import type {
  Span,
  ReadableSpan,
  SpanProcessor as OpenTelemetrySpanProcessor
} from "@opentelemetry/sdk-trace-base"

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
    const otelSpan = this.client.extension.createOpenTelemetrySpan(
      span.spanContext().spanId,
      span.parentSpanId || "",
      span.spanContext().traceId,
      span.startTime[0],
      span.startTime[1],
      span.endTime[0],
      span.endTime[1],
      span.name,
      span.attributes,
      span.instrumentationLibrary.name
    )

    const errors = span.events.filter(event => event.name == "exception")

    errors.forEach(e => {
      const eventAttributes = e["attributes"] as any

      otelSpan.setError(
        eventAttributes["exception.type"],
        eventAttributes["exception.message"],
        eventAttributes["exception.stacktrace"]
      )
    })

    otelSpan.close()
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

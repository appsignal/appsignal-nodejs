import {Span, SpanContext} from "@opentelemetry/api"
import {
  OpenTelemetrySpanProcessor,
  ReadableSpan
} from "./interfaces/span_processor"
import {BaseClient} from "./client"
import {NoopSpan} from "./noops"

export class SpanProcessor implements OpenTelemetrySpanProcessor {
  client: BaseClient

  constructor(client: BaseClient) {
    this.client = client
  }

  forceFlush(): Promise<void> {
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onStart(_span: Span, _parentContext: SpanContext): void {}

  onEnd(span: ReadableSpan, _parentContext: SpanContext): void {
    const appsignalSpan = this.client.tracer().currentSpan()

    if (!(appsignalSpan instanceof NoopSpan)) {
      this.client.extension.importOpenTelemetrySpan(
        span.spanContext().spanId,
        appsignalSpan.spanId,
        appsignalSpan.traceId,
        span.startTime[0],
        span.startTime[1],
        span.endTime[0],
        span.endTime[1],
        span.name,
        span.attributes,
        span.instrumentationLibrary.name
      )
    }
  }

  shutdown(): Promise<void> {
    return Promise.resolve()
  }
}

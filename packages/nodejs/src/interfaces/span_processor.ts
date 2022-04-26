import { HrTime, Span, SpanAttributes, SpanContext } from "@opentelemetry/api"

/**
 * OpenTelemetrySpanProcessor is based on OpenTelemetry's internal span processor.
 */
export interface OpenTelemetrySpanProcessor {
  /**
   * Forces to export all finished spans
   */
  forceFlush(): Promise<void>

  /**
   * Called when an OpenTelemetry {@link Span} is started, if the
   * `span.isRecording()` returns true.
   * @param span the OpenTelemetry Span that just started.
   */
  onStart(_span: Span, _parentContext: SpanContext): void

  /**
   * Called when an OpenTelemetry {@link Span} is ended, if the
   * `span.isRecording()` returns true.
   * @param span the Span that just ended.
   */
  onEnd(_span: ReadableSpan, _parentContext: SpanContext): void

  /**
   * Shuts down the processor. Called when the OpenTelemetry SDK is shut down.
   * This is an opportunity for processor to do any cleanup required.
   */
  shutdown(): Promise<void>
}

/**
 * ReadableSpan is based on a subset of OpenTelemetry's internal "readable"
 * spans, which have readonly attributes for exporting.
 */
export interface ReadableSpan {
  readonly name: string
  readonly spanContext: () => SpanContext
  readonly startTime: HrTime
  readonly endTime: HrTime
  readonly attributes: SpanAttributes
  readonly instrumentationLibrary: { name: string }
}

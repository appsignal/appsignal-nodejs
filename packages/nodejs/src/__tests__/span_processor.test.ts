import {SpanProcessor} from "../span_processor"
import {Client, Plugin, Metrics, Tracer} from "../interfaces"

import {Configuration} from "../config"
import {Logger} from "../logger"
import {NoopTracer, NoopMetrics} from "../noops"
import {Extension} from "../extension"
import {Instrumentation} from "../instrument"

class FakeClient implements Client {
  readonly VERSION = "0.0.0"
  readonly isActive = true
  readonly logger: Logger

  extension: Extension
  config: Configuration
  instrumentation: Instrumentation

  #tracer: Tracer
  #metrics: Metrics

  constructor() {
    this.extension = new Extension()
    this.logger = new Logger("stdout", "trace")
    this.config = new Configuration({})
    this.#tracer = new Tracer()
    this.#metrics = new Metrics()
    this.instrumentation = new Instrumentation(this.tracer(), this.metrics())
  }
  public start(): void {}
  public stop(calledBy?: string): void {}
  public tracer(): Tracer {
    return this.#tracer
  }
  public metrics(): Metrics {
    return this.#metrics
  }
  public instrument<T>({
    PLUGIN_NAME: name,
    instrument: fn
  }: {
    PLUGIN_NAME: string
    instrument: (module: T, tracer: NoopTracer, meter: NoopMetrics) => Plugin<T>
  }): this {
    return this
  }
  // start(): void {}
  // stop(calledBy?: string): void {}
  // tracer(): void {}
  // metrics(): void {}
  // instrument(): void {}
  // tracer(): Tracer {}
  // metrics(): Metrics {}
  // instrument<T>(plugin: {
  //   PLUGIN_NAME: string
  //   instrument: (module: T, tracer: Tracer, meter: Metrics) => Plugin<T>
  // }): this
}

describe("SpanProcessor", () => {
  it("creates a child span", () => {
    const client = new FakeClient()
    const processor = new SpanProcessor(client)

    processor.onStart({})
    // const span = new RootSpan()
    // const internal = span.toObject()

    // expect(span).toBeInstanceOf(RootSpan)
    // expect(internal.closed).toBeFalsy()
    // expect(typeof internal.start_time).toBe("number")
  })
})

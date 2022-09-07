import { AppsignalOptions } from "./config/options"
import { Extension } from "./extension"
import { Configuration } from "./config"
import { Metrics } from "./metrics"
import * as gcProbe from "./probes/v8"
import { Logger } from "./logger"
import { NoopMetrics } from "./noops"
import { demo } from "./demo"
import { VERSION } from "./version"

import { Span as OtelSpan } from "@opentelemetry/api"
import {
  ExpressInstrumentation,
  ExpressLayerType
} from "@opentelemetry/instrumentation-express"
import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { IORedisInstrumentation } from "@opentelemetry/instrumentation-ioredis"
import { KoaInstrumentation } from "@opentelemetry/instrumentation-koa"
import { MySQL2Instrumentation } from "@opentelemetry/instrumentation-mysql2"
import { MySQLInstrumentation } from "@opentelemetry/instrumentation-mysql"
import { NodeSDK } from "@opentelemetry/sdk-node"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg"
import { RedisDbStatementSerializer } from "./instrumentation/redis/serializer"
import { RedisInstrumentation as Redis4Instrumentation } from "@opentelemetry/instrumentation-redis-4"
import { RedisInstrumentation } from "@opentelemetry/instrumentation-redis"
import { SpanProcessor } from "./span_processor"

import * as fs from "fs"

/**
 * AppSignal for Node.js's main class.
 *
 * Provides methods to control the AppSignal instrumentation and the system
 * agent.
 *
 * @class
 */
export class Client {
  readonly VERSION = VERSION

  config: Configuration
  readonly logger: Logger
  extension: Extension
  readonly tracerProvider: NodeTracerProvider

  #metrics: Metrics

  /**
   * Global accessors for the AppSignal client
   */
  static get client(): Client {
    return global.__APPSIGNAL__
  }

  /**
   * Global accessors for the AppSignal Config
   */
  static get config(): Configuration {
    return this.client.config
  }

  /**
   * Global accessors for the AppSignal Logger
   */
  static get logger(): Logger {
    return this.client.logger
  }

  /**
   * Creates a new instance of the `Appsignal` object
   */
  constructor(options: Partial<AppsignalOptions> = {}) {
    this.config = new Configuration(options)
    this.extension = new Extension()
    this.logger = this.setUpLogger()
    this.storeInGlobal()

    if (this.isActive) {
      this.extension.start()
      this.#metrics = new Metrics()
    } else {
      this.#metrics = new NoopMetrics()
      console.error("AppSignal not starting, no valid configuration found")
    }

    this.initCoreProbes()
    this.tracerProvider = this.initOpenTelemetry()
  }

  /**
   * Returns `true` if the extension is loaded and configuration is valid
   */
  get isActive(): boolean {
    return (
      Extension.isLoaded &&
      this.config.isValid &&
      (this.config.data.active ?? false)
    )
  }

  set isActive(arg) {
    console.warn("Cannot set isActive property")
  }

  /**
   * Starts AppSignal with the given configuration. If no configuration is set
   * yet it will try to automatically load the configuration using the
   * environment loaded from environment variables and the current working
   * directory.
   */
  public start(): void {
    if (this.config.isValid) {
      this.extension.start()
    } else {
      console.error("Not starting, no valid AppSignal configuration found")
    }
  }

  /**
   * Stops the AppSignal agent.
   *
   * Call this before the end of your program to make sure the
   * agent is stopped as well.
   */
  public stop(calledBy?: string): void {
    if (calledBy) {
      console.log(`Stopping AppSignal (${calledBy})`)
    } else {
      console.log("Stopping AppSignal")
    }

    this.metrics().probes().stop()
    this.extension.stop()
  }

  /**
   * Internal private function used by the demo CLI.
   *
   * https://docs.appsignal.com/nodejs/command-line/demo.html
   *
   * @private
   */
  public demo() {
    demo(this)
  }

  /**
   * Returns the current `Metrics` object.
   *
   * To track application-wide metrics, you can send custom metrics to AppSignal.
   * These metrics enable you to track anything in your application, from newly
   * registered users to database disk usage. These are not replacements for custom
   * instrumentation, but provide an additional way to make certain data in your
   * code more accessible and measurable over time.
   *
   * With different types of metrics (gauges, counters and measurements)
   * you can track any kind of data from your apps and tag them with metadata
   * to easily spot the differences between contexts.
   */
  public metrics(): Metrics {
    return this.#metrics
  }

  /**
   * Initialises all the available probes to attach automatically at runtime.
   */
  private initCoreProbes() {
    const probes: any[] = [gcProbe]

    // load probes
    probes.forEach(({ PROBE_NAME, init }) =>
      this.#metrics.probes().register(PROBE_NAME, init(this.#metrics))
    )
  }

  /**
   * Initialises OpenTelemetry instrumentation
   */
  private initOpenTelemetry() {
    const sendParams = this.config.data.sendParams
    const sdk = new NodeSDK({
      instrumentations: [
        new HttpInstrumentation({
          headersToSpanAttributes: {
            server: { requestHeaders: this.config.data["requestHeaders"] }
          }
        }),
        new ExpressInstrumentation({
          requestHook: function (span: OtelSpan, info) {
            if (
              info.layerType === ExpressLayerType.REQUEST_HANDLER &&
              sendParams
            ) {
              // Request parameters to magic attributes
              const queryParams = info.request.query
              const requestBody = info.request.body
              const params = { ...queryParams, ...requestBody }
              span.setAttribute(
                "appsignal.request.parameters",
                JSON.stringify(params)
              )

              // Session data to magic attributes
              span.setAttribute(
                "appsignal.request.session_data",
                JSON.stringify(info.request.cookies)
              )
            }
          }
        }),
        new GraphQLInstrumentation(),
        new KoaInstrumentation({
          requestHook: function (span: OtelSpan, info) {
            if (sendParams) {
              // Request parameters to magic attributes
              const queryParams = info.context.request.query

              span.setAttribute(
                "appsignal.request.parameters",
                JSON.stringify(queryParams)
              )
            }
          }
        }),
        new MySQLInstrumentation(),
        new MySQL2Instrumentation(),
        new PgInstrumentation(),
        new RedisInstrumentation({
          dbStatementSerializer: RedisDbStatementSerializer
        }),
        new Redis4Instrumentation({
          dbStatementSerializer: RedisDbStatementSerializer
        }),
        new IORedisInstrumentation({
          requireParentSpan: false,
          dbStatementSerializer: RedisDbStatementSerializer
        })
      ]
    })

    sdk.start()

    const tracerProvider = new NodeTracerProvider()
    tracerProvider.addSpanProcessor(new SpanProcessor(this))

    // Add test mode span processor if private env vars are present
    const testMode = process.env["_APPSIGNAL_TEST_MODE"]
    const testModeFilePath = process.env["_APPSIGNAL_TEST_MODE_FILE_PATH"]
    if (testMode && testModeFilePath) {
      const spanProcessor = new TestModeSpanProcessor(testModeFilePath)
      tracerProvider.addSpanProcessor(spanProcessor)
    }

    tracerProvider.register()
    return tracerProvider
  }

  /**
   * Sets up the AppSignal logger with the output based on the `log` config option. If
   * the log file is not accessible, stdout will be the output.
   */
  private setUpLogger(): Logger {
    const logFilePath = this.config.logFilePath
    const logLevel = String(this.config.data["logLevel"])
    const logType = String(this.config.data["log"])
    let logger

    if (logType == "file" && logFilePath) {
      logger = new Logger(logType, logLevel, logFilePath)
    } else {
      logger = new Logger(logType, logLevel)
    }

    return logger
  }

  /**
   * Stores the client in global object after initializing
   */
  private storeInGlobal(): void {
    global.__APPSIGNAL__ = this
  }
}

class TestModeSpanProcessor {
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

    // Re-open the file for every write, as the test process might have
    // truncated it in between writes.
    const file = fs.openSync(this.#filePath, "a")
    fs.appendFileSync(file, `${JSON.stringify(serializableSpan)}\n`)
    fs.closeSync(file)
  }

  shutdown() {
    // Does nothing
    return Promise.resolve()
  }
}

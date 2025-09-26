import { AppsignalOptions } from "./config/options"
import { Extension } from "./extension"
import { Configuration } from "./config"
import { Metrics } from "./metrics"
import * as gcProbe from "./probes/v8"
import { BaseInternalLogger, InternalLogger } from "./internal_logger"
import { NoopMetrics, noopInternalLogger, noopLogger } from "./noops"
import { demo } from "./demo"
import { VERSION } from "./version"
import { setParams, setSessionData } from "./helpers"
import { BaseLogger, Logger, LoggerFormat, LoggerLevel } from "./logger"
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api"
import {
  PeriodicExportingMetricReader,
  AggregationTemporality,
  InstrumentType
} from "@opentelemetry/sdk-metrics"
import { CompositePropagator } from "@opentelemetry/core"
import { B3Propagator, B3InjectEncoding } from "@opentelemetry/propagator-b3"
import { W3CBaggagePropagator } from "@opentelemetry/core"
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto"

import type { Instrumentation } from "@opentelemetry/instrumentation"
import { AmqplibInstrumentation } from "@opentelemetry/instrumentation-amqplib"
import { BullMQInstrumentation } from "@appsignal/opentelemetry-instrumentation-bullmq"
import {
  ExpressInstrumentation,
  ExpressLayerType
} from "@opentelemetry/instrumentation-express"
import { FastifyInstrumentation } from "@opentelemetry/instrumentation-fastify"
import { GraphQLInstrumentation } from "@opentelemetry/instrumentation-graphql"
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http"
import { IORedisInstrumentation } from "@opentelemetry/instrumentation-ioredis"
import { KnexInstrumentation } from "@opentelemetry/instrumentation-knex"
import {
  KoaInstrumentation,
  KoaLayerType
} from "@opentelemetry/instrumentation-koa"
import { MongoDBInstrumentation } from "@opentelemetry/instrumentation-mongodb"
import { MongooseInstrumentation } from "@opentelemetry/instrumentation-mongoose"
import { MySQL2Instrumentation } from "@opentelemetry/instrumentation-mysql2"
import { MySQLInstrumentation } from "@opentelemetry/instrumentation-mysql"
import { NodeSDK, NodeSDKConfiguration } from "@opentelemetry/sdk-node"
import { NestInstrumentation } from "@opentelemetry/instrumentation-nestjs-core"
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg"
import { PrismaInstrumentation } from "@prisma/instrumentation"
import { RedisDbStatementSerializer } from "./instrumentation/redis/serializer"
import { RedisInstrumentation as Redis4Instrumentation } from "@opentelemetry/instrumentation-redis-4"
import { RedisInstrumentation } from "@opentelemetry/instrumentation-redis"
import {
  RestifyInstrumentation,
  LayerType as RestifyLayerType
} from "@opentelemetry/instrumentation-restify"
import { UndiciInstrumentation } from "@opentelemetry/instrumentation-undici"
import { SpanProcessor, TestModeSpanProcessor } from "./span_processor"
import { scheduler } from "./check_in/scheduler"

const DefaultInstrumentations = {
  "@appsignal/opentelemetry-instrumentation-bullmq": BullMQInstrumentation,
  "@opentelemetry/instrumentation-amqplib": AmqplibInstrumentation,
  "@opentelemetry/instrumentation-express": ExpressInstrumentation,
  "@opentelemetry/instrumentation-fastify": FastifyInstrumentation,
  "@opentelemetry/instrumentation-graphql": GraphQLInstrumentation,
  "@opentelemetry/instrumentation-http": HttpInstrumentation,
  "@opentelemetry/instrumentation-ioredis": IORedisInstrumentation,
  "@opentelemetry/instrumentation-knex": KnexInstrumentation,
  "@opentelemetry/instrumentation-koa": KoaInstrumentation,
  "@opentelemetry/instrumentation-mongodb": MongoDBInstrumentation,
  "@opentelemetry/instrumentation-mongoose": MongooseInstrumentation,
  "@opentelemetry/instrumentation-mysql2": MySQL2Instrumentation,
  "@opentelemetry/instrumentation-mysql": MySQLInstrumentation,
  "@opentelemetry/instrumentation-nestjs-core": NestInstrumentation,
  "@opentelemetry/instrumentation-pg": PgInstrumentation,
  "@opentelemetry/instrumentation-redis": RedisInstrumentation,
  "@opentelemetry/instrumentation-redis-4": Redis4Instrumentation,
  "@opentelemetry/instrumentation-restify": RestifyInstrumentation,
  "@opentelemetry/instrumentation-undici": UndiciInstrumentation,
  "@prisma/instrumentation": PrismaInstrumentation
}

export type DefaultInstrumentationName = keyof typeof DefaultInstrumentations

type ConfigArg<T> = T extends new (...args: infer U) => unknown ? U[0] : never
type DefaultInstrumentationsConfigMap = {
  [Name in DefaultInstrumentationName]?: ConfigArg<
    (typeof DefaultInstrumentations)[Name]
  >
}

type NodeSDKInstrumentationsOption = NodeSDKConfiguration["instrumentations"]

export type Options = AppsignalOptions & {
  additionalInstrumentations: NodeSDKInstrumentationsOption
}

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
  readonly internalLogger: InternalLogger
  extension: Extension

  #metrics: Metrics
  #sdk?: NodeSDK
  #additionalInstrumentations: NodeSDKInstrumentationsOption
  #isActive: boolean

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
    return this.client?.config
  }

  /**
   * Global accessors for the AppSignal integration Logger
   */
  static get internalLogger(): InternalLogger {
    if (this.client) {
      return this.client.internalLogger
    } else {
      return noopInternalLogger
    }
  }

  /**
   * Global accessors for the AppSignal Logger API
   */
  static logger(
    group: string,
    level: LoggerLevel = "info",
    format: LoggerFormat = "autodetect"
  ): Logger {
    if (this.client) {
      return this.client.logger(group, level, format)
    } else {
      return noopLogger
    }
  }

  /**
   * Starts AppSignal with the given configuration. If no configuration is set
   * yet it will try to automatically load the configuration using the
   * environment loaded from environment variables.
   */
  constructor(options: Partial<Options> = {}) {
    this.#additionalInstrumentations = options.additionalInstrumentations || []

    this.config = new Configuration(options)
    this.extension = new Extension()
    this.internalLogger = this.setupInternalLogger()
    this.storeInGlobal()

    // These will be overwritten if AppSignal can be started
    this.#metrics = new NoopMetrics()
    this.#isActive = false

    if (process.env._APPSIGNAL_DIAGNOSE === "true") {
      this.internalLogger.info(
        "AppSignal not starting: running in diagnose mode"
      )

      return
    }

    const validationError = this.config.validationError()

    if (validationError) {
      console.info(`AppSignal not starting: ${validationError}`)

      return
    }

    if (!Extension.isLoaded) {
      this.extension.logLoadingErrors()

      console.error("AppSignal not starting: extension failed to load")

      return
    }

    this.extension.start()

    this.#metrics = new Metrics()
    this.#isActive = true

    if (this.config.data.initializeOpentelemetrySdk) {
      this.#sdk = this.initOpenTelemetry()
      this.setUpOpenTelemetryLogger()
    }

    this.initCoreProbes()
  }

  public get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Stops the AppSignal agent.
   *
   * Call this before the end of your program to make sure the
   * agent is stopped as well.
   */
  public async stop(calledBy?: string): Promise<void> {
    if (calledBy) {
      console.log(`Stopping AppSignal (${calledBy})`)
    } else {
      console.log("Stopping AppSignal")
    }

    this.metrics().probes().stop()
    await Promise.all([this.#sdk?.shutdown(), scheduler.shutdown()])
    this.extension.stop()
  }

  /**
   * Internal private function used by the demo CLI.
   *
   * https://docs.appsignal.com/nodejs/3.x/command-line/demo.html
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

  public logger(
    group: string,
    level: LoggerLevel = "info",
    format: LoggerFormat = "plaintext"
  ): Logger {
    if (this.isActive) {
      return new BaseLogger(this, group, level, format)
    } else {
      return noopLogger
    }
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

  private defaultInstrumentationsConfig(): DefaultInstrumentationsConfigMap {
    const sendParams = this.config.data.sendParams
    const sendSessionData = this.config.data.sendSessionData
    const requestHeaders = this.config.data.requestHeaders

    return {
      "@appsignal/opentelemetry-instrumentation-bullmq": {
        emitCreateSpansForBulk: false,
        emitCreateSpansForFlow: true,
        requireParentSpanForPublish: true
      },
      "@opentelemetry/instrumentation-express": {
        requestHook: function (_span, info) {
          if (info.layerType === ExpressLayerType.REQUEST_HANDLER) {
            if (sendParams) {
              const routeParams = info.request.params
              const queryParams = info.request.query
              const requestBody = info.request.body
              const params = { ...routeParams, ...queryParams, ...requestBody }
              setParams(params)
            }

            if (sendSessionData) {
              setSessionData(info.request.cookies)
            }
          }
        }
      },
      "@opentelemetry/instrumentation-fastify": {
        requestHook: function (_span, info) {
          const queryParams = info.request.query
          const requestBody = info.request.body
          const params = { ...queryParams, ...requestBody }
          setParams(params)
        }
      },
      "@opentelemetry/instrumentation-graphql": {
        ignoreTrivialResolveSpans: true,
        mergeItems: true,
        allowValues: false
      },
      "@opentelemetry/instrumentation-http": {
        headersToSpanAttributes: {
          server: { requestHeaders }
        }
      },
      "@opentelemetry/instrumentation-ioredis": {
        dbStatementSerializer: RedisDbStatementSerializer
      },
      "@opentelemetry/instrumentation-koa": {
        requestHook: function (span, info) {
          if (sendParams && info.layerType === KoaLayerType.ROUTER) {
            const queryParams = info.context.request.query
            setParams(queryParams, span)
          }
        }
      },
      "@opentelemetry/instrumentation-redis": {
        dbStatementSerializer: RedisDbStatementSerializer
      },
      "@opentelemetry/instrumentation-redis-4": {
        dbStatementSerializer: RedisDbStatementSerializer
      },
      "@opentelemetry/instrumentation-restify": {
        requestHook: (span, info) => {
          if (
            sendParams &&
            info.layerType === RestifyLayerType.REQUEST_HANDLER
          ) {
            const request = info.request
            const params = Object.assign(
              request.params || {},
              request.query || {}
            )
            setParams(params, span)
          }
        }
      },
      "@opentelemetry/instrumentation-undici": {
        requireParentforSpans: true
      },
      "@prisma/instrumentation": {
        middleware: true
      }
    }
  }

  private defaultInstrumentations(): Instrumentation[] {
    const disabledInstrumentations =
      this.config.data.disableDefaultInstrumentations
    if (disabledInstrumentations === true) {
      return []
    }

    const instrumentationConfigs =
      this.defaultInstrumentationsConfig() as Record<string, any>
    return Object.entries(DefaultInstrumentations)
      .filter(
        ([name, _constructor]) =>
          !(disabledInstrumentations || ([] as string[])).includes(name)
      )
      .map(
        ([name, constructor]) =>
          new constructor(instrumentationConfigs[name] || {})
      )
  }

  public opentelemetryInstrumentations(): NodeSDKInstrumentationsOption {
    return this.#additionalInstrumentations.concat(
      this.defaultInstrumentations()
    )
  }

  /**
   * Initialises OpenTelemetry instrumentation
   */
  private initOpenTelemetry() {
    const testMode = process.env["_APPSIGNAL_TEST_MODE"]
    const testModeFilePath = process.env["_APPSIGNAL_TEST_MODE_FILE_PATH"]
    let spanProcessor

    if (testMode && testModeFilePath) {
      spanProcessor = new TestModeSpanProcessor(testModeFilePath)
    } else {
      spanProcessor = new SpanProcessor(this)
    }

    const instrumentations = this.opentelemetryInstrumentations()

    // Metrics initialization
    let metricReader
    if (this.config.data["enableOpentelemetryHttp"]) {
      metricReader = new PeriodicExportingMetricReader({
        exporter: new PatchedOTLPMetricExporter({
          url: `http://localhost:${this.config.data["opentelemetryPort"]}/v1/metrics`
        })
      })
    }

    const sdk = new NodeSDK({
      instrumentations,
      spanProcessor,
      metricReader,
      textMapPropagator: new CompositePropagator({
        propagators: [
          new W3CBaggagePropagator(),
          new B3Propagator(),
          new B3Propagator({ injectEncoding: B3InjectEncoding.MULTI_HEADER })
        ]
      })
    })

    sdk.start()

    return sdk
  }

  /**
   * Sets up the AppSignal logger with the output based on the `log` config option. If
   * the log file is not accessible, stdout will be the output.
   */
  private setupInternalLogger(): InternalLogger {
    const logFilePath = this.config.logFilePath
    const logLevel = String(this.config.data["logLevel"])
    const logType = String(this.config.data["log"])
    let logger

    if (logType == "file" && logFilePath) {
      logger = new BaseInternalLogger(logType, logLevel, logFilePath)
    } else {
      logger = new BaseInternalLogger(logType, logLevel)
    }

    return logger
  }

  /**
   * Sets up the OpenTelemetry diag logger based on our integration logger level.
   * If our integration logger level is "silly" ("trace"), the OpenTelemetry diag debug messages
   * are logged.
   */
  private setUpOpenTelemetryLogger(): void {
    if (this.config.data["logLevel"] === "trace") {
      diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
    }
  }

  /**
   * Stores the client in global object after initializing
   */
  private storeInGlobal(): void {
    global.__APPSIGNAL__ = this
  }

  get tracer(): any {
    console.error(
      "The `appsignal.tracer()` function was called, but it has been removed in AppSignal for Node.js package version 3.x. Please read our migration guide to upgrade to this new version of our package: https://docs.appsignal.com/nodejs/3.x/migration-guide.html. It is also possible to downgrade to version 2.x, after which this code will work again."
    )
    return () => {}
  }
}

// Custom metrics aggregation temporality selector
// This requires a patch because the Node.js exporter doesn't allow this to be
// specified per metric type.
const customAggregationTemporality: Partial<
  Record<InstrumentType, AggregationTemporality>
> = {
  COUNTER: AggregationTemporality.DELTA,
  UP_DOWN_COUNTER: AggregationTemporality.DELTA,
  OBSERVABLE_COUNTER: AggregationTemporality.DELTA,
  OBSERVABLE_GAUGE: AggregationTemporality.CUMULATIVE,
  OBSERVABLE_UP_DOWN_COUNTER: AggregationTemporality.DELTA,
  HISTOGRAM: AggregationTemporality.DELTA
}

class PatchedOTLPMetricExporter extends OTLPMetricExporter {
  override selectAggregationTemporality(instrumentType: InstrumentType) {
    const aggregationTemporality = customAggregationTemporality[instrumentType]
    return aggregationTemporality != undefined
      ? aggregationTemporality
      : super.selectAggregationTemporality(instrumentType)
  }
}

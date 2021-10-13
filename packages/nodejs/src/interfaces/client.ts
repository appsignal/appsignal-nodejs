import { Tracer } from "./tracer"
import { Metrics } from "./metrics"
import { Plugin } from "./plugin"
import { Configuration } from "../config"

/**
 * AppSignal for Node.js's main class.
 *
 * Provides methods to control the AppSignal instrumentation and the system
 * agent.
 */
export interface Client {
  /**
   * The current version of the integration.
   */
  readonly VERSION: string

  /**
   * Returns `true` if the agent is loaded and configuration is valid.
   */
  readonly isActive: boolean

  config: Configuration

  /**
   * Starts AppSignal with the given configuration. If no configuration is set
   * yet it will try to automatically load the configuration using the
   * environment loaded from environment variables and the current working
   * directory.
   */
  start(): void

  /**
   * Stops the AppSignal agent.
   *
   * Call this before the end of your program to make sure the
   * agent is stopped as well.
   */
  stop(calledBy?: string): void

  /**
   * Returns the current `Tracer` instance.
   *
   * If the agent is inactive when this method is called, the method
   * returns a `NoopTracer`, which will do nothing.
   */
  tracer(): Tracer

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
  metrics(): Metrics

  /**
   * Allows a named module to be modified by a function. The function `fn`
   * returns a `Plugin`, which will be loaded by the instrumentation manager
   * when the module is required.
   */
  instrument<T>(plugin: {
    PLUGIN_NAME: string
    instrument: (module: T, tracer: Tracer, meter: Metrics) => Plugin<T>
  }): this
}

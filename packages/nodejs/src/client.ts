import { Client, Metrics, Plugin, Tracer, AppsignalOptions } from "./interfaces"

import { Extension } from "./extension"
import { Configuration } from "./config"
import { BaseTracer } from "./tracer"
import { BaseMetrics } from "./metrics"
import { NoopTracer, NoopMetrics } from "./noops"
import { Instrumentation } from "./instrument"
import { initCorePlugins, initCoreProbes } from "./bootstrap"
import { demo } from "./demo"
import { VERSION } from "./version"

/**
 * AppSignal for Node.js's main class.
 *
 * Provides methods to control the AppSignal instrumentation and the system
 * agent.
 *
 * @class
 */
export class BaseClient implements Client {
  readonly VERSION = VERSION

  config: Configuration
  extension: Extension
  instrumentation: Instrumentation

  #tracer: Tracer = new BaseTracer()
  #metrics: Metrics

  /**
   * Global accessors to Client and Config
   */
  static get client(): Client {
    return global.__APPSIGNAL__
  }

  static get config(): Configuration {
    return global.__APPSIGNAL__?.config
  }

  /**
   * Creates a new instance of the `Appsignal` object
   */
  constructor(options: Partial<AppsignalOptions> = {}) {
    const { ignoreInstrumentation } = options

    this.config = new Configuration(options)
    this.extension = new Extension()
    this.storeInGlobal()

    if (this.isActive) {
      this.extension.start()
      this.#metrics = new BaseMetrics()
    } else {
      this.#metrics = new NoopMetrics()
    }

    this.instrumentation = new Instrumentation(this.tracer(), this.metrics())

    initCorePlugins(this.instrumentation, { ignoreInstrumentation })
    initCoreProbes(this.metrics())
  }

  /**
   * Returns `true` if the agent is loaded and configuration is valid
   */
  get isActive(): boolean {
    return Extension.isLoaded && this.config.isValid && this.config.data.active!
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

    this.extension.stop()
  }

  /**
   * Returns the current `Tracer` instance.
   *
   * If the agent is inactive when this method is called, the method
   * returns a `NoopTracer`, which will do nothing.
   */
  public tracer(): Tracer {
    if (!this.isActive) {
      return new NoopTracer()
    }

    return this.#tracer
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
   * Allows a named module to be modified by a function. The function `fn`
   * returns a `Plugin`, which will be loaded by the instrumentation manager
   * when the module is required.
   */
  public instrument<T>({
    PLUGIN_NAME: name,
    instrument: fn
  }: {
    PLUGIN_NAME: string
    instrument: (module: T, tracer: Tracer, meter: Metrics) => Plugin<T>
  }): this {
    this.instrumentation.load(name, fn)
    return this
  }

  /**
   * Sends a demonstration/test sample for a exception and a performance issue.
   */
  public demo() {
    return demo(this.tracer())
  }

  /**
   * Stores the client in global object after initializing
   */
  private storeInGlobal(): void {
    global.__APPSIGNAL__ = this
  }
}

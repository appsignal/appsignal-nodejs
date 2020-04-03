import { Agent } from "./agent"
import { Configuration } from "./config"
import { Tracer } from "./tracer"
import { NoopTracer } from "./noops"
import { VERSION } from "./version"

import { Metrics } from "./metrics"
import { Instrumentation } from "./instrument"
import * as http from "./instrumentation/http"

import { AppsignalOptions } from "./types/options"
import { Plugin } from "./interfaces/plugin"
import { Tracer as ITracer } from "./interfaces/tracer"

/**
 * AppSignal for Node.js's main class.
 *
 * Provides methods to control the AppSignal instrumentation and the system
 * agent.
 *
 * @class
 */
export class Client {
  public VERSION = VERSION

  public config: Configuration
  public agent: Agent
  public instrumentation: Instrumentation

  private _tracer: Tracer
  private _metrics: Metrics

  /**
   * Creates a new instance of the `Appsignal` object
   */
  constructor(options: AppsignalOptions) {
    // Agent is not started by default
    const { active = false } = options

    this._tracer = new Tracer()
    this._metrics = new Metrics()

    this.config = new Configuration(options)
    this.agent = new Agent({ active })
    this.instrumentation = new Instrumentation(this._tracer)

    this.instrumentation.load(http.PLUGIN_NAME, http.instrument)
  }

  /**
   * Returns `true` if the agent is loaded and configuration is valid
   */
  get isActive(): boolean {
    return this.agent.isLoaded && this.config.isValid
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
      this.agent.start()
    } else {
      console.error("Not starting, no valid config for this environment")
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

    this.agent.stop()
  }

  /**
   * Returns the current `Tracer` instance.
   *
   * If the agent is inactive when this method is called, the method
   * returns a `NoopTracer`, which will do nothing.
   */
  public tracer(): ITracer {
    if (!this.isActive) {
      return new NoopTracer()
    }

    return this._tracer
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
  public metrics(): Metrics | undefined {
    if (!this.isActive) {
      console.warn(
        "Cannot access the metrics object when the agent is inactive"
      )
      return
    }

    return this._metrics
  }

  /**
   * Allows a named module to be modified by a function. The function `fn`
   * returns a `Plugin`, which will be loaded by the instrumentation manager
   * when the module is required.
   */
  public instrument<T>(
    name: string,
    fn: (module: T, tracer: Tracer) => Plugin<T>
  ): this {
    this.instrumentation.load(name, fn)
    return this
  }
}

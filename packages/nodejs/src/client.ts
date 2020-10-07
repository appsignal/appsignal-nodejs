import { VERSION } from "./version"

import { Agent } from "./agent"
import { Configuration } from "./config"
import { BaseTracer } from "./tracer"
import { BaseMetrics } from "./metrics"
import { NoopTracer, NoopMetrics } from "./noops"

import { Instrumentation } from "./instrument"
import { httpPlugin, httpsPlugin } from "./instrumentation/http"
import * as pgPlugin from "./instrumentation/pg"
import * as redisPlugin from "./instrumentation/redis"

import { AppsignalOptions } from "./types/options"
import { Plugin } from "./interfaces/plugin"
import { Tracer } from "./interfaces/tracer"
import { Metrics } from "./interfaces/metrics"

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

  public agent: Agent
  public config: Configuration
  public instrumentation: Instrumentation

  private _tracer: Tracer
  private _metrics: Metrics

  /**
   * Creates a new instance of the `Appsignal` object
   */
  constructor(options: Partial<AppsignalOptions> = {}) {
    // Agent is not started by default
    const { active = false, ignoreInstrumentation } = options

    this._tracer = new BaseTracer()
    this._metrics = new BaseMetrics()

    this.config = new Configuration(options)
    this.agent = new Agent({ active })

    this.instrumentation = new Instrumentation(this.tracer(), this.metrics())

    let plugins: any[] = [httpPlugin, httpsPlugin, redisPlugin, pgPlugin]

    // cull ignored plugins
    if (ignoreInstrumentation && Array.isArray(ignoreInstrumentation)) {
      plugins = plugins.filter(p => ignoreInstrumentation.includes(p))
    }

    // load plugins
    plugins.forEach(p => {
      try {
        this.instrument(p)
      } catch (e) {
        console.warn(`Failed to instrument "${p.PLUGIN_NAME}": ${e.message}`)
      }
    })
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
  public tracer(): Tracer {
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
  public metrics(): Metrics {
    if (!this.isActive) {
      return new NoopMetrics()
    }

    return this._metrics
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
}

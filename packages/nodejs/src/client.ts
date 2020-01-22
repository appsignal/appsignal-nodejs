import { Extension } from "./extension"
import { Configuration } from "./config"
import { Tracer } from "./tracer"
import { NoopTracer } from "./noops"
import { VERSION } from "./version"

import { ITracer } from "./interfaces/ITracer"
import { AppsignalOptions } from "./types/options"

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
  public extension: Extension

  private _tracer: Tracer

  /**
   * Creates a new instance of the `Appsignal` object
   */
  constructor(options: AppsignalOptions) {
    // Agent is not started by default
    const { active = false } = options

    this._tracer = new Tracer()

    this.config = new Configuration(options)
    this.extension = new Extension({ active })
  }

  /**
   * Returns `true` if the extension is loaded and configuration is valid
   */
  get isActive(): boolean {
    return this.extension.isLoaded && this.config.isValid
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

    this.extension.stop()
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
}

import { EventEmitter } from "events"

/**
 * The Minutely probes object.
 */
export class Probes extends EventEmitter {
  private _timers = new Map<string, NodeJS.Timeout>()

  constructor() {
    super()
  }

  /**
   * Number of probes that are registered.
   */
  get count(): number {
    return this._timers.size
  }

  /**
   * Registers a new minutely probe. Using a probe `name` that has already been set
   * will overwrite the current probe.
   */
  public register(name: string, fn: () => void): this {
    this._timers.set(
      name,
      setInterval(() => this.emit(name), 60 * 1000)
    )

    return this.on(name, fn)
  }

  /**
   * Unregisters all probes and clears the timers.
   */
  public clear(): this {
    this._timers.forEach(t => clearInterval(t))
    this._timers = new Map()
    return this
  }
}

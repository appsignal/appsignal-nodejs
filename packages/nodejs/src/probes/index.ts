import { EventEmitter } from "events"
import { Probes } from "../interfaces"

/**
 * The Minutely probes object.
 */
export class BaseProbes implements Probes {
  #probes: ProbeRunner
  #running = true

  constructor({ run = true } = {}) {
    this.#probes = new BaseProbeRunner()
    if (!run) this.stop()
  }

  public stop(): this {
    this.#probes.clear()
    this.#probes = new NoopProbeRunner()
    this.#running = false
    return this
  }

  get isRunning(): boolean {
    return this.#running
  }

  get count(): number {
    return this.#probes.count
  }

  public register(name: string, fn: () => void): this {
    this.#probes.register(name, fn)
    return this
  }

  public unregister(name: string): this {
    this.#probes.unregister(name)
    return this
  }

  public clear(): this {
    this.#probes.clear()
    return this
  }
}

type ProbeRunner = {
  readonly count: number
  register(name: string, fn: () => void): void
  unregister(name: string): void
  clear(): void
}

class BaseProbeRunner extends EventEmitter implements ProbeRunner {
  #timers = new Map<string, NodeJS.Timeout>()

  constructor() {
    super()
  }

  /**
   * Number of probes that are registered.
   */
  get count(): number {
    return this.#timers.size
  }

  /**
   * Registers a new minutely probe. Using a probe `name` that has already been set
   * will overwrite the current probe.
   */
  public register(name: string, fn: () => void): void {
    this.#timers.set(
      name,
      setInterval(() => this.emit(name), 60 * 1000)
    )

    this.removeAllListeners(name)
    this.on(name, fn)
  }

  public unregister(name: string): void {
    const timer = this.#timers.get(name)

    if (typeof timer !== "undefined") {
      clearInterval(timer)
      this.#timers.delete(name)
      this.removeAllListeners(name)
    }
  }

  /**
   * Unregisters all probes and clears the timers.
   */
  public clear(): void {
    this.#timers.forEach(t => clearInterval(t))
    this.#timers = new Map()
    this.removeAllListeners()
  }
}

class NoopProbeRunner implements ProbeRunner {
  readonly count: number = 0

  public register(_name: string, _fn: () => void): void {
    return
  }

  public unregister(_name: string): void {
    return
  }

  public clear(): void {
    return
  }
}

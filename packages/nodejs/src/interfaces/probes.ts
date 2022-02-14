/**
 * The Minutely probes object.
 */
export interface Probes {
  /**
   * Permanently stops the probes system, unregistering all probes
   * and clearing the timers.
   */
  stop(): this

  /**
   * Whether the probes system is running.
   */
  readonly isRunning: boolean

  /**
   * Number of probes that are registered.
   */
  readonly count: number

  /**
   * Registers a new minutely probe. Using a probe `name` that has already been set
   * will overwrite the current probe.
   */
  register(name: string, fn: () => void): this

  /**
   * Unregisters an existing minutely probe.
   */
  unregister(name: string): this

  /**
   * Unregisters all probes and clears the timers.
   */
  clear(): this
}

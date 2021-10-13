/**
 * The Minutely probes object.
 */
export interface Probes {
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
   * Unregisters all probes and clears the timers.
   */
  clear(): this
}

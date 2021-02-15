import {extension} from "./extension"

/**
 * The public interface for the extension.
 *
 * @class
 */
export class Agent {
  isLoaded = false

  constructor(options?: {active: boolean}) {
    if (options?.active) this.start()
  }

  /**
   * Starts the extension.
   */
  public start(): boolean {
    try {
      extension.start()
      this.isLoaded = true
    } catch (e) {
      if (e.message === "Extension module not loaded") {
        console.warn(
          "AppSignal extension not loaded. This could mean that your current environment isn't supported, or that another error has occured."
        )
      } else {
        console.error(
          `Failed to load AppSignal extension with error: ${e.message}. Please email us at support@appsignal.com for support.`
        )
      }

      this.isLoaded = false
    }

    return this.isLoaded
  }

  /**
   * Stops the extension.
   */
  public stop(): boolean {
    if (this.isLoaded) {
      extension.stop()
      this.isLoaded = false
    }

    return this.isLoaded
  }

  public diagnose(): object {
    if (this.isLoaded) {
      return JSON.parse(extension.diagnoseRaw())
    } else {
      return {}
    }
  }
}

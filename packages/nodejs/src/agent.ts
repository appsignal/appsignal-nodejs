import { extension } from "./extension"

/**
 * The public interface for the extension.
 *
 * @class
 */
export class Agent {
  public isLoaded = false

  constructor(options?: { active: boolean }) {
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
      if (e.message !== "Extension module not loaded") {
        console.error(
          `Failed to load extension: ${e.message}. please run \`appsignal diagnose\`
            and email us at support@appsignal.com`
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
}

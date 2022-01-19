import { extension, isLoaded as extensionLoaded } from "./extension_wrapper"

/**
 * The public interface for the extension.
 *
 * @class
 */
export class Extension {
  static isLoaded = extensionLoaded

  constructor(options?: { active: boolean }) {
    if (options?.active) this.start()
  }

  /**
   * Starts the extension.
   */
  public start() {
    try {
      extension.start()
    } catch (e) {
      if (e.message === "Extension module not loaded") {
        console.warn(
          "AppSignal extension not loaded. This could mean that your current environment isn't supported, or that another error has occurred."
        )
      } else {
        console.error(
          `Failed to load AppSignal extension with error: ${e.message}. Please email us at support@appsignal.com for support.`
        )
      }
    }
  }

  /**
   * Stops the extension.
   */
  public stop() {
    extension.stop()
  }

  public diagnose(): object {
    process.env._APPSIGNAL_DIAGNOSE = "true"
    const diagnostics_report_string = extension.diagnoseRaw()
    delete process.env._APPSIGNAL_DIAGNOSE

    try {
      return JSON.parse(diagnostics_report_string)
    } catch (error) {
      return {
        error: error,
        output: (diagnostics_report_string || "").split("\n")
      }
    }
  }

  /**
   * Determines if the app is running inside a container
   */
  public runningInContainer(): boolean {
    return extension.runningInContainer()
  }
}

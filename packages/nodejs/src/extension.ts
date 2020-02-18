// the C++ extension is loaded here (via commonjs for compatibility).
// we keep this as a locally scoped variable; the C++ bindings
// should not be visible publicly.
const { extension } = require("../build/Release/extension.node")

/**
 * The public interface for the extension.
 * 
 * @class
 */
export class Extension {
  public isLoaded = false

  constructor(options: { [key: string]: any }) {
    if (options.active) this.start()
  }

  /**
   * Starts the extension.
   */
  public start(): boolean {
    try {
      extension.start()
      this.isLoaded = true
    } catch (e) {
      console.error(
        `Failed to load extension ${e}, please run \`appsignal diagnose\`
          and email us at support@appsignal.com`
      )

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

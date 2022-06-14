import { extension, isLoaded as extensionLoaded } from "./extension_wrapper"
import { Data } from "./internal/data"

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
    extension.start()
  }

  /**
   * Stops the extension.
   */
  public stop() {
    extension.stop()
  }

  public createOpenTelemetrySpan(
    spanId: string,
    parentSpanId: string,
    traceId: string,
    startTimeSec: number,
    startTimeNsec: number,
    endTimeSec: number,
    endTimeNsec: number,
    name: string,
    attributes: Record<string, any>,
    instrumentationLibraryName: string
  ): Span {
    const ref = extension.createOpenTelemetrySpan(
      spanId,
      parentSpanId,
      traceId,
      startTimeSec,
      startTimeNsec,
      endTimeSec,
      endTimeNsec,
      name,
      Data.generate(attributes),
      instrumentationLibraryName
    )
    return new Span(ref)
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

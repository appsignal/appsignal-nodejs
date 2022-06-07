import { AppsignalOptions } from "./interfaces"
import { BaseClient } from "./client"

/**
 * AppSignal for Node.js's client for OpenTelemetry.
 *
 * This is a wrapper around the AppSignal main Client class, with defaults for
 * OpenTelemetry.
 *
 * @class
 */
export class OpenTelemetryClient extends BaseClient {
  constructor(options: Partial<AppsignalOptions> = {}) {
    super({
      instrumentRedis: false,
      instrumentHttp: false,
      instrumentPg: false,
      ...options
    })
  }
}

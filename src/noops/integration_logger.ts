import { IntegrationLogger } from "../integration_logger"

export class NoopIntegrationLogger implements IntegrationLogger {
  error(_message: string) {
    // noop
  }
  warn(_message: string) {
    // noop
  }
  info(_message: string) {
    // noop
  }
  debug(_message: string) {
    // noop
  }
  trace(_message: string) {
    // noop
  }
}

export const noopIntegrationLogger = new NoopIntegrationLogger()

import { InternalLogger } from "../internal_logger"

export class NoopInternalLogger implements InternalLogger {
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

export const noopInternalLogger = new NoopInternalLogger()

import { InternalLogger } from "../internal_logger"

/** @internal */
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

/** @internal */
export const noopInternalLogger = new NoopInternalLogger()

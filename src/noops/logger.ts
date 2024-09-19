import { Logger, LoggerAttributes } from "../logger"

/** @internal */
export class NoopLogger implements Logger {
  trace(_message: string, _attributes?: LoggerAttributes) {
    // noop
  }
  debug(_message: string, _attributes?: LoggerAttributes) {
    // noop
  }
  info(_message: string, _attributes?: LoggerAttributes) {
    // noop
  }
  log(_message: string, _attributes?: LoggerAttributes) {
    // noop
  }
  warn(_message: string, _attributes?: LoggerAttributes) {
    // noop
  }
  error(_message: string, _attributes?: LoggerAttributes) {
    // noop
  }
}

/** @internal */
export const noopLogger = new NoopLogger()

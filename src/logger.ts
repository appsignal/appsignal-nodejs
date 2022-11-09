import { Client } from "./client"

export type LoggerLevel = "trace" | "debug" | "info" | "warn" | "error"

type LoggerAttributes = Record<string, string | number | boolean>

const LOGGER_LEVEL_SEVERITY: Record<LoggerLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 5,
  error: 6
}

const UNKNOWN_SEVERITY = 0

function severity(level: LoggerLevel) {
  return LOGGER_LEVEL_SEVERITY[level] ?? UNKNOWN_SEVERITY
}

export class Logger {
  #client: Client
  #group: string
  severityThreshold: number

  constructor(client: Client, group: string, level: LoggerLevel = "info") {
    this.#client = client
    this.#group = group
    this.severityThreshold = severity(level)

    if (this.severityThreshold == UNKNOWN_SEVERITY) {
      this.#client.integrationLogger.warn(
        `Logger level must be "trace", "debug", "info", "warn" or "error", ` +
          `but "${level}" was given. Logger level set to "info".`
      )

      this.severityThreshold = severity("info")
    }
  }

  trace(message: string, attributes?: LoggerAttributes) {
    this.log(severity("trace"), message, attributes)
  }

  debug(message: string, attributes?: LoggerAttributes) {
    this.log(severity("debug"), message, attributes)
  }

  info(message: string, attributes?: LoggerAttributes) {
    this.log(severity("info"), message, attributes)
  }

  warn(message: string, attributes?: LoggerAttributes) {
    this.log(severity("warn"), message, attributes)
  }

  error(message: string, attributes?: LoggerAttributes) {
    this.log(severity("error"), message, attributes)
  }

  private log(
    severity: number,
    message: string,
    attributes: LoggerAttributes = {}
  ) {
    if (severity < this.severityThreshold) {
      return
    }

    this.#client.extension.log(this.#group, severity, `${message}`, attributes)
  }
}

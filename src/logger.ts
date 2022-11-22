import { Client } from "./client"

export type LoggerLevel = "trace" | "debug" | "info" | "log" | "warn" | "error"

type LoggerAttributes = Record<string, string | number | boolean>

const LOGGER_LEVEL_SEVERITY: Record<LoggerLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  log: 4,
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
    if (typeof group != "string") {
      throw new TypeError(
        `Logger group name must be a string; ${typeof group} given`
      )
    }

    this.#client = client
    this.#group = group
    this.severityThreshold = severity(level)

    if (this.severityThreshold == UNKNOWN_SEVERITY) {
      this.#client.integrationLogger.warn(
        `Logger level must be "trace", "debug", "info", "log", "warn" or "error", ` +
          `but "${level}" was given. Logger level set to "info".`
      )

      this.severityThreshold = severity("info")
    }
  }

  trace(message: string, attributes?: LoggerAttributes) {
    this.sendLog(severity("trace"), message, attributes)
  }

  debug(message: string, attributes?: LoggerAttributes) {
    this.sendLog(severity("debug"), message, attributes)
  }

  info(message: string, attributes?: LoggerAttributes) {
    this.sendLog(severity("info"), message, attributes)
  }

  log(message: string, attributes?: LoggerAttributes) {
    this.sendLog(severity("log"), message, attributes)
  }

  warn(message: string, attributes?: LoggerAttributes) {
    this.sendLog(severity("warn"), message, attributes)
  }

  error(message: string, attributes?: LoggerAttributes) {
    this.sendLog(severity("error"), message, attributes)
  }

  private sendLog(
    severity: number,
    message: string,
    attributes: LoggerAttributes = {}
  ) {
    if (severity < this.severityThreshold) {
      return
    }

    this.#client.extension.log(
      this.#group,
      severity,
      String(message),
      attributes
    )
  }
}

import Transport, { TransportStreamOptions } from "winston-transport"
import { Client } from "./client"
import { LOGGER_LEVEL_SEVERITY as RUST_LOGGER_LEVEL_SECURITY } from "./logger"

const NPM_LOGGER_LEVEL_SEVERITY = {
  error: 6,
  warn: 5,
  info: 3,
  http: 3,
  verbose: 2,
  debug: 2,
  silly: 1
}

const SYSLOG_LOGGER_LEVEL_SEVERITY = {
  emerg: 9,
  alert: 8,
  crit: 7,
  error: 6,
  warning: 5,
  notice: 4,
  info: 3,
  debug: 2
}

const LOGGER_LEVEL_SEVERITY: Record<string, number> = {
  ...RUST_LOGGER_LEVEL_SECURITY,
  ...NPM_LOGGER_LEVEL_SEVERITY,
  ...SYSLOG_LOGGER_LEVEL_SEVERITY
}

const UNKNOWN_SEVERITY = 0

function severity(level: string) {
  return LOGGER_LEVEL_SEVERITY[level] ?? UNKNOWN_SEVERITY
}

export type WinstonTransportOptions = {
  group: string
} & TransportStreamOptions

export class WinstonTransport extends Transport {
  #group: string

  constructor({ group, ...opts }: WinstonTransportOptions) {
    super(opts)

    if (typeof group != "string") {
      throw new TypeError(
        `Logger group name must be a string; ${typeof group} given`
      )
    }

    this.#group = group
  }

  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit("logged", info)
    })

    const client = Client.client
    if (!client || !client.isActive) {
      return
    }

    const levelSeverity = severity(info[Symbol.for("level")])
    if (levelSeverity == UNKNOWN_SEVERITY) {
      return
    }

    const [message, attributes] = this.parseInfo(info)

    client.extension.log(this.#group, levelSeverity, message, attributes)

    callback()
  }

  private parseInfo(info: any): [string, Record<string, any>] {
    const splat = info[Symbol.for("splat")] || []

    const extras = Object.fromEntries(
      Object.entries(info).filter(
        ([key, _]) =>
          typeof key != "symbol" &&
          key != "level" &&
          key != "message" &&
          // added by winston's `format.timestamp()`
          key != "timestamp" &&
          key.match(/^\d+$/) === null
      )
    )

    const items = [info["message"], ...splat, extras]

    const stringItems = items.filter(item => {
      return (
        typeof item === "string" ||
        typeof item === "number" ||
        typeof item === "boolean" ||
        typeof item === "undefined" ||
        item === null
      )
    })
    const message = stringItems.map(item => String(item)).join(" ")

    const objectItems = items.filter(
      item => typeof item === "object" && !Array.isArray(item)
    )

    const mergedObjectItems = objectItems.reduce((acc, x) => {
      return { ...acc, ...x }
    }, {})

    const attributes = Object.fromEntries(
      Object.entries(mergedObjectItems).filter(
        ([_, value]) =>
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
      )
    )

    return [message, attributes]
  }
}

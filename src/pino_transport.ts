import { LOGGER_LEVEL_SEVERITY } from "./logger"
import build from "pino-abstract-transport"
import { Client } from "./client"

type PinoTransportOptions = {
  client: Client
  group: string
}

const appsignalPinoTransport = ({
  client,
  group = "app"
}: PinoTransportOptions) => {
  return build(async (source: any) => {
    for await (const obj of source) {
      sendLogs(parseInfo(obj, group), client)
    }
  })

  async function sendLogs(data: Record<string, any>, client: Client) {
    client.extension.log(
      data.group || "app",
      data.severity,
      0,
      data.msg,
      data.attributes
    )
  }
}

function parseInfo(
  obj: Record<string, any>,
  group: string
): Record<string, any> {
  const { hostname, level, msg, ...attributes } = obj

  return {
    severity: getSeverity(level),
    hostname,
    group,
    msg,
    attributes: flattenAttributes(attributes)
  }
}

function flattenAttributes(
  attributes: Record<string, any>,
  prefix = ""
): Record<string, any> {
  let result: Record<string, any> = {}

  for (const key in attributes) {
    const newKey = prefix ? `${prefix}.${key}` : key

    if (
      typeof attributes[key] === "object" &&
      attributes[key] !== null &&
      !Array.isArray(attributes[key])
    ) {
      const flattened = flattenAttributes(attributes[key], newKey)
      result = { ...result, ...flattened }
    } else {
      result[newKey] = attributes[key]
    }
  }

  return result
}

function getSeverity(level: number): number {
  if (level >= 50) return LOGGER_LEVEL_SEVERITY.error
  if (level >= 40) return LOGGER_LEVEL_SEVERITY.warn
  if (level >= 30) return LOGGER_LEVEL_SEVERITY.info
  if (level >= 20) return LOGGER_LEVEL_SEVERITY.debug
  return LOGGER_LEVEL_SEVERITY.trace
}

export = appsignalPinoTransport

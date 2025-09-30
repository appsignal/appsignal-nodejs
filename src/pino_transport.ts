import { LOGGER_LEVEL_SEVERITY, LOGGER_FORMAT } from "./logger"
import build from "pino-abstract-transport"
import { Extension } from "./extension"

type PinoTransportOptions = {
  group?: string
}

type LogData = {
  severity: number
  message: string
  attributes: Record<string, any>
}

const appsignalPinoTransport = ({ group = "app" }: PinoTransportOptions) => {
  return build(async (source: any) => {
    // We expect this code to be running in a worker thread and for the
    // extension to have already been loaded and started on the main thread.
    // Since we expect the extension to already have been initialised, we
    // pass `{ active: false }` to avoid initialising it again.
    const extension = new Extension({ active: false })

    for await (const obj of source) {
      sendLogs(extension, group, parseInfo(obj))
    }
  })
}

async function sendLogs(extension: Extension, group: string, data: LogData) {
  extension.log(
    group,
    data.severity,
    LOGGER_FORMAT.autodetect,
    data.message,
    data.attributes
  )
}

function parseInfo(obj: Record<string, any>): LogData {
  const { level, msg, ...attributes } = obj

  return {
    severity: getSeverity(level),
    message: msg,
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

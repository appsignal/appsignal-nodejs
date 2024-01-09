import { randomBytes } from "crypto"
import { Client } from "./client"
import { hrTime } from "./utils"

/**
 * Sends a demonstration/test sample for a exception and a performance issue.
 *
 * Note that the agent must be active for at least 60 seconds in order for the payload
 * to be sent to AppSignal.
 */
export function demo(client: Client) {
  const { sec: startSec, nsec: startNsec } = hrTime()
  const traceId = randomBytes(10).toString("base64")
  const rootSpanId = randomBytes(10).toString("base64")
  const childSpanId = randomBytes(10).toString("base64")
  // Performance sample
  const performanceRootSpan = client.extension.createOpenTelemetrySpan(
    rootSpanId,
    "",
    traceId,
    startSec,
    startNsec,
    startSec + 1,
    startNsec * 1.2,
    "GET /demo",
    { "appsignal.tag.demo_sample": true },
    "@opentelemetry/instrumentation-http"
  )
  performanceRootSpan.close()
  const performanceChildSpan = client.extension.createOpenTelemetrySpan(
    childSpanId,
    rootSpanId,
    traceId,
    startSec,
    startNsec * 1.2,
    startSec + 1,
    startNsec,
    "request handler - /",
    { "express.type": "request_handler" },
    "@opentelemetry/instrumentation-express"
  )
  performanceChildSpan.close()

  // Error sample
  const errorTraceId = randomBytes(10).toString("base64")
  const errorRootSpanId = randomBytes(10).toString("base64")
  const errorRootSpan = client.extension.createOpenTelemetrySpan(
    errorRootSpanId,
    "",
    errorTraceId,
    startSec,
    startNsec,
    startSec + 1,
    startNsec + 200,
    "GET /demo",
    { "appsignal.tag.demo_sample": true },
    "@opentelemetry/instrumentation-http"
  )
  try {
    throw new Error(
      "Hello world! This is an error used for demonstration purposes."
    )
  } catch (error) {
    if (error instanceof Error) {
      errorRootSpan.setError(error.name, error.message, error.stack as string)
    }
  }
  errorRootSpan.close()
}

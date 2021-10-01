import url from "url"
import { IncomingMessage, ServerResponse } from "http"
import { Client, Metrics } from "@appsignal/nodejs"

function handleWebVital(
  metric: { name: string; value: number },
  meter: Metrics
) {
  meter.addDistributionValue(
    `webvital_${metric.name.toLowerCase()}`,
    metric.value
  )
}

function handleNextMetric(
  metric: { name: string; value: number },
  meter: Metrics
) {
  switch (metric.name) {
    case "Next.js-hydration":
      meter.addDistributionValue(`nextjs_hydration_time`, metric.value)
      break
    case "Next.js-route-change-to-render":
      meter.addDistributionValue(
        `nextjs_route_change_to_render_time`,
        metric.value
      )
      break
    case "Next.js-render":
      meter.addDistributionValue(`nextjs_render_time`, metric.value)
      break
    default:
      break
  }
}

/**
 * Returns an HTTP handler function for handling custom metrics sent via
 * Next.js v9.4+s Web Vitals reporting.
 *
 * When used with a Next.js custom server, this must be called only when the
 * `pathname` of your request is `/__appsignal-web-vitals`. If passed to
 * `express.use()` for use as a middleware, this route will be created for you.
 *
 * Usage of this function is EXPERIMENTAL and may change or be deprecated
 * in future releases.
 */
export function getWebVitalsHandler(appsignal: Client) {
  return function (
    req: IncomingMessage,
    res: ServerResponse,
    next?: (err?: any) => void
  ) {
    const meter = appsignal.metrics()

    // we always expect this to be obtained from `http.Server`
    const { pathname } = url.parse(req.url!, true)

    // this pathname is ignored by our http instrumentation
    if (pathname !== "/__appsignal-web-vitals") {
      return next ? next() : res.end()
    }

    const chunks: any[] = []

    req.on("data", chunk => chunks.push(chunk))

    req.on("end", () => {
      const data = Buffer.concat(chunks)
      const metric = JSON.parse(data.toString())

      if (metric.label === "web-vital") {
        handleWebVital(metric, meter)
      } else if (metric.label === "custom") {
        handleNextMetric(metric, meter)
      }
    })

    res.statusCode = 200

    return res.end()
  }
}

import url from "url"
import { Appsignal, Metrics } from "@appsignal/nodejs"

import { Request, Response, NextFunction, RequestHandler } from "express"

function handleWebVital(
  metric: { name: string; value: number },
  meter: Metrics
) {
  meter.addDistributionValue(
    `nextjs_webvital_${metric.name.toLowerCase()}`,
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

export function webVitalsMiddleware(appsignal: Appsignal): RequestHandler {
  return function (req: Request, res: Response, next: NextFunction) {
    const meter = appsignal.metrics()
    const { pathname } = url.parse(req.url, true)

    if (pathname !== "/__appsignal-web-vitals") {
      return next()
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

    return res.sendStatus(200)
  }
}

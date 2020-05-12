import url from "url"
import { Appsignal } from "@appsignal/nodejs"
import { ServerResponse, IncomingMessage } from "http"

interface NextServer {
  router: {
    dynamicRoutes?: {
      page: string
      match: (
        pathname: string | null | undefined
      ) => false | { [param: string]: any }
    }[]
  }
  getRequestHandler(): (
    req: IncomingMessage,
    res: ServerResponse,
    ...rest: any[]
  ) => Promise<void>
}

/**
 * Wraps Next.js' `app.getRequestHandler()` method in order to augment the current
 * span with data.
 */
export function getRequestHandler<T extends NextServer>(
  appsignal: Appsignal,
  app: T
) {
  const handler = app.getRequestHandler()

  return function (req: IncomingMessage, res: ServerResponse, ...rest: any[]) {
    const span = appsignal.tracer().currentSpan()
    const { pathname } = url.parse(req.url || "/", true)

    if (span) {
      const routes = app.router.dynamicRoutes || []
      const matched = routes.filter(el => el.match(pathname))[0]

      // passing { debug: true } to the `Appsignal` constructor will log
      // data about the current route to the console. don't rely on this
      // working in future!
      if (appsignal.config.debug) {
        console.log("[APPSIGNAL]: Next.js debug data", {
          routes,
          matched,
          pathname
        })
      }

      if (matched) {
        // matched to a dynamic route
        span.setName(`${req.method} ${matched.page}`)
      } else if (!matched && pathname === "/") {
        // the root
        span.setName(`${req.method} ${pathname}`)
      } else {
        span.setName(`${req.method} [unknown route]`)
      }
    }

    return handler(req, res, ...rest)
  }
}

import fs from "fs"
import https from "https"
import http from "http"

import { Configuration } from "./config"
import { URL, URLSearchParams } from "url"
import { Client } from "./client"

import { context } from "@opentelemetry/api"
import { suppressTracing } from "@opentelemetry/core"

const REDIRECT_COUNT = Symbol("redirect-count")

type TransmitterRequestOptions = {
  method: string
  params?: URLSearchParams
  callback: ((stream: http.IncomingMessage) => void) & {
    [REDIRECT_COUNT]?: number
  }
  onError: (error: Error) => void
}

const REDIRECT_STATUS_CODES = [301, 302, 303, 307, 308]
const REDIRECT_GET_STATUS_CODES = [301, 302, 303]
const MAX_REDIRECTS = 20

class MaxRedirectsError extends Error {
  constructor() {
    super("Maximum number of redirects reached")

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MaxRedirectsError)
    }

    this.name = "MaxRedirectsError"
  }
}

export class Transmitter {
  #config: Configuration
  #url: string
  #body: string

  constructor(url: string, body = "") {
    this.#config = Client.config ?? new Configuration({})
    this.#url = url
    this.#body = body
  }

  public downloadStream() {
    return new Promise<http.IncomingMessage>((resolve, reject) => {
      this.request({
        method: "GET",

        callback(stream) {
          const statusCode = stream.statusCode ?? 999

          if (statusCode >= 400) {
            reject({ kind: "statusCode", statusCode })
          } else {
            resolve(stream)
          }
        },

        onError(error) {
          reject({ kind: "requestError", error })
        }
      })
    })
  }

  public async transmit() {
    return new Promise<{ status: number; body: any }>((resolve, reject) => {
      this.request({
        method: "POST",
        params: this.configParams(),

        callback(stream) {
          const responseStatus = stream.statusCode ?? 999
          stream.setEncoding("utf8")
          let responseBody = ""

          stream
            .on("data", (chunk: any) => {
              responseBody += chunk
            })
            .on("end", () => {
              let parsedResponse
              try {
                parsedResponse = JSON.parse(responseBody)
              } catch {
                parsedResponse = {}
              }

              resolve({ status: responseStatus, body: parsedResponse })
            })
        },

        onError(error) {
          reject({ error: error })
        }
      })
    })
  }

  public request(requestOptions: TransmitterRequestOptions) {
    context.with(suppressTracing(context.active()), () => {
      const { method, params = new URLSearchParams(), onError } = requestOptions

      const initialOptions = {
        method,
        ...this.urlRequestOptions()
      }

      const { protocol, path } = initialOptions

      const options = {
        ...initialOptions,
        ...this.paramsRequestOptions(path ?? "", params),
        ...this.bodyRequestOptions(method),
        ...this.caRequestOptions(protocol ?? "")
      }

      const module = this.requestModule(protocol ?? "")

      const callback = this.handleRedirectsCallback(requestOptions)

      const request = module.request(options, callback)

      request.on("error", onError)

      this.writeRequest(method, request)
      request.end()
    })
  }

  private handleRedirectsCallback({
    method,
    params,
    callback,
    onError
  }: TransmitterRequestOptions): (stream: http.IncomingMessage) => void {
    return stream => {
      const responseStatus = stream.statusCode ?? 999
      const isRedirect = REDIRECT_STATUS_CODES.indexOf(responseStatus) !== -1
      const newURL = this.getLocationHeader(stream.rawHeaders || [])

      if (isRedirect && typeof newURL !== "undefined") {
        const redirectCount = callback[REDIRECT_COUNT] ?? 0

        if (redirectCount >= MAX_REDIRECTS) {
          onError(new MaxRedirectsError())
        } else {
          callback[REDIRECT_COUNT] = redirectCount + 1

          let newMethod = method
          const isGetRedirect =
            REDIRECT_GET_STATUS_CODES.indexOf(responseStatus) !== -1

          if (isGetRedirect) {
            newMethod = "GET"
          }

          const newTransmitter = new Transmitter(newURL, this.#body)
          newTransmitter.request({
            method: newMethod,
            params,
            callback,
            onError
          })
        }
      } else {
        callback(stream)
      }
    }
  }

  // Temporary fix to deal with the header setter removal in Node.js 19
  // https://github.com/nodejs/node/issues/45510
  private getLocationHeader(rawHeaders: Array<any>): string | undefined {
    let location
    rawHeaders.forEach((element, index) => {
      // Skip odd indices as rawHeaders are represented as an array of pairs (key, value)
      if (Math.abs(index % 2) == 1) return

      if (element == "Location") {
        location = rawHeaders[index + 1]
      }
    })

    return location
  }

  private configParams(): URLSearchParams {
    const config_data = this.#config.data

    return new URLSearchParams({
      api_key: config_data["pushApiKey"] || "",
      name: config_data["name"] || "",
      environment: config_data["environment"] || "",
      hostname: config_data["hostname"] || ""
    })
  }

  private requestModule(protocol: string): typeof http | typeof https {
    return protocol == "http:" ? http : https
  }

  private writeRequest(method: string, request: http.ClientRequest) {
    if (method == "POST") {
      request.write(this.#body)
    }
  }

  private urlRequestOptions(): https.RequestOptions {
    const requestUrl = new URL(this.#url)

    return {
      protocol: requestUrl.protocol,
      host: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.pathname + requestUrl.search
    }
  }

  private paramsRequestOptions(
    path: string,
    params: URLSearchParams
  ): https.RequestOptions {
    let paramsString = params.toString()
    if (paramsString != "") {
      paramsString = `?${paramsString}`
    }

    return {
      path: `${path}${paramsString}`
    }
  }

  private bodyRequestOptions(method: string): https.RequestOptions {
    if (method != "POST") return {}

    return {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": this.#body.length
      }
    }
  }

  private caRequestOptions(protocol: string): https.RequestOptions {
    if (protocol != "https:") return {}

    const configData = this.#config.data
    const caFilePathFromConfig = configData["caFilePath"] || ""

    try {
      fs.accessSync(caFilePathFromConfig, fs.constants.R_OK)
      return {
        ca: fs.readFileSync(caFilePathFromConfig, "utf-8").toString()
      }
    } catch {
      console.warn(
        `Provided caFilePath: '${caFilePathFromConfig}' is not readable.`
      )
      return {}
    }
  }
}

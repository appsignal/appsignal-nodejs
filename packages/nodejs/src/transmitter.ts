import fs from "fs"
import https from "https"
import http from "http"

import { Configuration } from "./config"
import { URL, URLSearchParams } from "url"

type TransmitterRequestOptions = {
  method: string
  params?: URLSearchParams
  callback: (stream: http.IncomingMessage) => void
  onError: (error: Error) => void
}

export class Transmitter {
  #config: Configuration
  #url: string
  #body: string

  constructor(url: string, body = "") {
    this.#config = new Configuration({})
    this.#url = url
    this.#body = body
  }

  public downloadStream() {
    return new Promise<http.IncomingMessage>((resolve, reject) => {
      this.request({
        method: "GET",

        callback(stream) {
          const statusCode = stream.statusCode!

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
          const responseStatus = stream.statusCode!
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

  public request({
    method,
    params = new URLSearchParams(),
    callback,
    onError
  }: TransmitterRequestOptions) {
    const initialOptions = {
      method,
      ...this.urlRequestOptions()
    }

    const { protocol, path } = initialOptions

    const options = {
      ...initialOptions,
      ...this.paramsRequestOptions(path!, params),
      ...this.bodyRequestOptions(method),
      ...this.caRequestOptions(protocol!)
    }

    const module = this.requestModule(protocol!)

    const request = module.request(options, callback)

    request.on("error", onError)

    this.writeRequest(method, request)
    request.end()
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

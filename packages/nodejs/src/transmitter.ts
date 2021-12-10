import fs from "fs"
import path from "path"
import https from "https"
import http from "http"

import { Configuration } from "./config"
import { URL, URLSearchParams } from "url"
import { HashMap } from "@appsignal/types"

export class Transmitter {
  #config: Configuration
  #url: string
  #data: string

  constructor(url: string, data = "", active = true) {
    this.#config = new Configuration({ active })
    this.#url = url
    this.#data = data
  }

  public async transmit() {
    return new Promise<HashMap<any>>((resolve, reject) => {
      const config_data = this.#config.data
      const params = new URLSearchParams({
        api_key: config_data["pushApiKey"] || "",
        name: config_data["name"] || "",
        environment: config_data["environment"] || "",
        hostname: config_data["hostname"] || ""
      })

      const url = new URL(`${this.#url}?${params.toString()}`)
      const opts = this.requestOptions(url)
      const requestModule = url.protocol == "http:" ? http : https

      const request = requestModule.request(opts, (stream: any) => {
        const responseStatus = stream.statusCode
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

            if (responseStatus == 200) {
              resolve({ status: responseStatus, body: parsedResponse })
            } else {
              reject({ status: responseStatus, body: parsedResponse })
            }
          })
      })

      request.write(this.#data)
      request.end()
    })
  }

  private requestOptions(requestUrl: URL): HashMap<any> {
    const configData = this.#config.data

    return {
      method: "POST",
      protocol: requestUrl.protocol,
      host: requestUrl.hostname,
      port: requestUrl.port,
      path: requestUrl.toString(),
      headers: {
        "Content-Type": "application/json",
        "Content-Length": this.#data.length
      },
      cert: fs.readFileSync(
        path.resolve(__dirname, "../cert/cacert.pem"),
        "utf-8"
      )
    }
  }
}

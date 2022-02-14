import { SpanTestRegistry } from "../../../../../test/registry"
import nock from "nock"
import { HashMap } from "@appsignal/types"
import { BaseClient as Client } from "../../../../client"
import { BaseTracer as Tracer } from "../../../../tracer"
import { instrument } from "../../http"
import { ChildSpan } from "../../../../span"

describe("HTTP outgoing requests", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"

  let http: any
  let client: Client
  let tracer: Tracer

  const DEFAULT_OPTS = {
    active: true,
    name,
    pushApiKey
  }

  beforeEach(() => {
    SpanTestRegistry.clear()
    client = new Client({ ...DEFAULT_OPTS })
    tracer = new Tracer()
    http = require("http")
    instrument(http, tracer).install()
  })

  afterEach(() => {
    client.stop()
  })

  async function performRequest() {
    return new Promise<HashMap<any>>((resolve, reject) => {
      const options = {
        host: "example.com",
        path: "/foo",
        method: "GET"
      }
      const request = http.request(options, (stream: any) => {
        stream.on("data", () => {}).on("end", resolve)
      })
      request.on("error", (error: Error) => {
        reject({ error: error })
      })
      request.end()
    })
  }

  it("creates a span for the outgoing HTTP request", async () => {
    nock("http://example.com").get("/foo").reply(200, "response body")
    const span = tracer.createSpan() // Create any root span
    expect(SpanTestRegistry.spans).toHaveLength(1)

    await performRequest()

    expect(SpanTestRegistry.spans).toHaveLength(2)
    const lastSpan = SpanTestRegistry.lastSpan()
    expect(lastSpan).toEqual(expect.any(ChildSpan))
    expect(lastSpan.toObject()).toMatchObject({
      attributes: { "appsignal:category": "request.http", method: "GET" },
      error: null,
      name: "GET http://localhost",
      sample_data: {},
      closed: true
    })
  })
})

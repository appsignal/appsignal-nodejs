import { Extension } from "../extension"
import { BaseClient } from "../client"
import { BaseTracer as Tracer } from "../tracer"
import { BaseMetrics as Metrics } from "../metrics"
import { NoopTracer, NoopMetrics } from "../noops"

jest.mock("../tracer")

describe("BaseClient", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"

  let client: BaseClient

  // enableMinutelyProbes is set to false so we don't leak timers
  const DEFAULT_OPTS = { name, pushApiKey, enableMinutelyProbes: false }

  beforeEach(() => {
    client = new BaseClient({ ...DEFAULT_OPTS })
  })

  it("starts the client", () => {
    const startSpy = jest.spyOn(client.extension, "start")
    client.start()
    expect(startSpy).toHaveBeenCalled()
  })

  it("stops the client", () => {
    const stopSpy = jest.spyOn(client.extension, "stop")
    client.stop()
    expect(stopSpy).toHaveBeenCalled()
  })

  it("stores the client on global object", () => {
    expect(global.__APPSIGNAL__).toEqual(client)
  })

  it("returns the client from global object", () => {
    expect(BaseClient.client).toEqual(client)
  })

  it("returns the client config from global object", () => {
    expect(BaseClient.config).toEqual(client.config)
  })

  it("does not start the client if the config is not valid", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    // config does not include a push API key
    client = new BaseClient({ name, active: true })
    expect(startSpy).not.toHaveBeenCalled()
  })

  it("does not start the client if the active option is false", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client = new BaseClient(DEFAULT_OPTS)
    expect(startSpy).not.toHaveBeenCalled()
  })

  it("starts the client when the active option is true", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client = new BaseClient({ ...DEFAULT_OPTS, active: true })
    expect(startSpy).toHaveBeenCalled()
  })

  it("returns a NoopTracer if the agent isn't started", () => {
    const tracer = client.tracer()
    expect(tracer).toBeInstanceOf(NoopTracer)
  })

  it("returns a `Tracer` object if the agent is started", () => {
    client = new BaseClient({ ...DEFAULT_OPTS, active: true })
    const tracer = client.tracer()
    expect(tracer).toBeInstanceOf(Tracer)
  })

  it("returns a NoopMetrics if the agent isn't started", () => {
    const meter = client.metrics()
    expect(meter).toBeInstanceOf(NoopMetrics)
  })

  it("returns a `Metrics` object if the agent is started", () => {
    client = new BaseClient({ ...DEFAULT_OPTS, active: true })
    const meter = client.metrics()
    expect(meter).toBeInstanceOf(Metrics)
  })
})

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

  const DEFAULT_OPTS = { name, pushApiKey }

  beforeEach(() => {
    client = new BaseClient({ ...DEFAULT_OPTS })
  })

  afterEach(() => {
    client.stop()
    jest.restoreAllMocks()
  })

  it("starts the client", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client.start()
    expect(startSpy).toHaveBeenCalled()
  })

  it("stops the client", () => {
    const extensionStopSpy = jest.spyOn(Extension.prototype, "stop")
    client.stop()
    expect(extensionStopSpy).toHaveBeenCalled()
  })

  it("stops the probes when the client is active", () => {
    client = new BaseClient({ ...DEFAULT_OPTS, active: true })
    const probes = client.metrics().probes()
    expect(probes.isRunning).toEqual(true)

    client.stop()
    expect(probes.isRunning).toEqual(false)
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

  it("does not start the client if config is not valid", () => {
    process.env["APPSIGNAL_PUSH_API_KEY"] = undefined
    const startSpy = jest.spyOn(client.extension, "start")
    client = new BaseClient({ name, enableMinutelyProbes: false })
    expect(startSpy).not.toHaveBeenCalled()
  })

  it("starts the client when the active option is true", () => {
    const startSpy = jest.spyOn(client.extension, "start")
    client = new BaseClient({ ...DEFAULT_OPTS, active: true })
    expect(startSpy).not.toHaveBeenCalled()
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

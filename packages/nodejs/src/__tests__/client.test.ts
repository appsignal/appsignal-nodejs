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
    client.start()
    expect(client.isActive).toBeTruthy()
  })

  it("stops the client", () => {
    client.stop()
    expect(client.isActive).toBeFalsy()
  })

  it("stores the client on global object", () => {
    expect(global.__APPSIGNAL__).toEqual(client)
  })

  it("does not start the client if config is not valid", () => {
    process.env["APPSIGNAL_PUSH_API_KEY"] = undefined
    client = new BaseClient({ name, enableMinutelyProbes: false })
    expect(client.isActive).toBeFalsy()
  })

  it("starts the client when the active option is true", () => {
    client = new BaseClient({ ...DEFAULT_OPTS, active: true })
    expect(client.isActive).toBeTruthy()
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

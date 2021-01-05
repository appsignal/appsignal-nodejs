import { Client } from "../client"
import { BaseTracer as Tracer } from "../tracer"
import { BaseMetrics as Metrics } from "../metrics"
import { NoopTracer, NoopMetrics } from "../noops"

jest.mock("../tracer")

describe("Client", () => {
  const name = "TEST APP"
  const apiKey = "TEST_API_KEY"

  let client: Client

  // enableMinutelyProbes is set to false so we don't leak timers
  const DEFAULT_OPTS = { name, apiKey, enableMinutelyProbes: false }

  beforeEach(() => {
    client = new Client({ ...DEFAULT_OPTS })
  })

  it("starts the client", () => {
    client.start()
    expect(client.isActive).toBeTruthy()
  })

  it("stops the client", () => {
    client.stop()
    expect(client.isActive).toBeFalsy()
  })

  it("starts the client when the active option is true", () => {
    client = new Client({ ...DEFAULT_OPTS, active: true })
    expect(client.isActive).toBeTruthy()
  })

  it("returns a NoopTracer if the agent isn't started", () => {
    const tracer = client.tracer()
    expect(tracer).toBeInstanceOf(NoopTracer)
  })

  it("returns a `Tracer` object if the agent is started", () => {
    client = new Client({ ...DEFAULT_OPTS, active: true })
    const tracer = client.tracer()
    expect(tracer).toBeInstanceOf(Tracer)
  })

  it("returns a NoopMetrics if the agent isn't started", () => {
    const meter = client.metrics()
    expect(meter).toBeInstanceOf(NoopMetrics)
  })

  it("returns a `Metrics` object if the agent is started", () => {
    client = new Client({ ...DEFAULT_OPTS, active: true })
    const meter = client.metrics()
    expect(meter).toBeInstanceOf(Metrics)
  })
})

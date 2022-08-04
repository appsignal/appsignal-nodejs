import { Extension } from "../extension"
import { Client } from "../client"
import { Metrics } from "../metrics"
import { NoopMetrics } from "../noops"
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node"

describe("Client", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"

  let client: Client

  const DEFAULT_OPTS = { name, pushApiKey }

  beforeEach(() => {
    client = new Client({ ...DEFAULT_OPTS })
  })

  afterEach(() => {
    client.stop()
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
    client = new Client({ ...DEFAULT_OPTS, active: true })
    const probes = client.metrics().probes()
    expect(probes.isRunning).toEqual(true)

    client.stop()
    expect(probes.isRunning).toEqual(false)
  })

  it("stores the client on global object", () => {
    expect(global.__APPSIGNAL__).toEqual(client)
  })

  it("returns the client from global object", () => {
    expect(Client.client).toEqual(client)
  })

  it("returns the client config from global object", () => {
    expect(Client.config).toEqual(client.config)
  })

  it("returns the logger from global object", () => {
    expect(Client.logger).toEqual(client.logger)
  })

  it("sets the logger level to info by default and uses a file transport", () => {
    expect(Client.logger.type).toEqual("file")
    expect(Client.logger.level).toEqual("info")
  })

  it("sets the logger level to the translated one", () => {
    client = new Client({ ...DEFAULT_OPTS, logLevel: "trace" })

    expect(Client.logger.level).toEqual("silly")
  })

  it("uses a console transport for logging if specified", () => {
    client = new Client({ ...DEFAULT_OPTS, log: "stdout" })

    expect(Client.logger.type).toEqual("stdout")
  })

  it("does not start the client if the config is not valid", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    // config does not include a push API key
    client = new Client({ name, active: true })
    expect(startSpy).not.toHaveBeenCalled()
  })

  it("does not start the client if the active option is false", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client = new Client(DEFAULT_OPTS)
    expect(startSpy).not.toHaveBeenCalled()
  })

  it("starts the client when the active option is true", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client = new Client({ ...DEFAULT_OPTS, active: true })
    expect(startSpy).toHaveBeenCalled()
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

  it("sets up an OpenTelemetry `NodeTracerProvider` in the tracerProvider property", () => {
    client = new Client(DEFAULT_OPTS)
    expect(client.tracerProvider).toBeInstanceOf(NodeTracerProvider)
  })
})

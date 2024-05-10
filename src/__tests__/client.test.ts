import {
  InstrumentationTestRegistry,
  instrumentationNames
} from "../../test/instrumentation_registry"
import { Extension } from "../extension"
import { Client } from "../client"
import { Metrics } from "../metrics"
import { NoopInternalLogger, NoopLogger, NoopMetrics } from "../noops"
import { Instrumentation } from "@opentelemetry/instrumentation"
import { BaseInternalLogger } from "../internal_logger"
import { BaseLogger } from "../logger"

describe("Client", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"

  let client: Client

  const DEFAULT_OPTS = { name, pushApiKey }

  beforeEach(() => {
    InstrumentationTestRegistry.clear()
    client = new Client({ ...DEFAULT_OPTS })
  })

  afterEach(async () => {
    await client.stop()
  })

  it("starts the extension when the client is active", () => {
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client = new Client({ ...DEFAULT_OPTS, active: true })
    expect(startSpy).toHaveBeenCalled()
  })

  it("stops the extension when the client is stopped", async () => {
    const extensionStopSpy = jest.spyOn(Extension.prototype, "stop")
    await client.stop()
    expect(extensionStopSpy).toHaveBeenCalled()
  })

  it("starts and stops the probes when the client is active", async () => {
    client = new Client({ ...DEFAULT_OPTS, active: true })
    const probes = client.metrics().probes()
    expect(probes.isRunning).toEqual(true)

    await client.stop()
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

  it("returns the integration logger from global object", () => {
    expect(Client.internalLogger).toEqual(client.internalLogger)
  })

  it("returns a noop integration logger if the client has not been initialised", () => {
    global.__APPSIGNAL__ = undefined as any
    expect(Client.internalLogger).toBeInstanceOf(NoopInternalLogger)
  })

  it("returns the user logger from global object if the client is active", () => {
    client = new Client({ ...DEFAULT_OPTS, active: true })
    expect(Client.logger("groupname")).toBeInstanceOf(BaseLogger)
  })

  it("returns a noop user logger if the client is not active", () => {
    expect(Client.logger("groupname")).toBeInstanceOf(NoopLogger)
  })

  it("returns a noop user logger if the client has not been initialised", () => {
    global.__APPSIGNAL__ = undefined as any
    expect(Client.logger("groupname")).toBeInstanceOf(NoopLogger)
  })

  it("sets the integration logger level to info by default and uses a file transport", () => {
    expect((Client.internalLogger as BaseInternalLogger).type).toEqual("file")
    expect((Client.internalLogger as BaseInternalLogger).level).toEqual("info")
  })

  it("sets the integration logger level to the translated one", () => {
    client = new Client({ ...DEFAULT_OPTS, logLevel: "trace" })

    expect((Client.internalLogger as BaseInternalLogger).level).toEqual("silly")
  })

  it("uses a console transport for integration logging if specified", () => {
    client = new Client({ ...DEFAULT_OPTS, log: "stdout" })

    expect((Client.internalLogger as BaseInternalLogger).type).toEqual("stdout")
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

  it("does not start the client if diagnose mode is enabled", () => {
    process.env._APPSIGNAL_DIAGNOSE = "true"
    const startSpy = jest.spyOn(Extension.prototype, "start")
    client = new Client({ ...DEFAULT_OPTS, active: true })
    expect(startSpy).not.toHaveBeenCalled()
    delete process.env._APPSIGNAL_DIAGNOSE
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

  it("initializes the OpenTelemetry SDK when active", () => {
    client = new Client({ ...DEFAULT_OPTS, active: true })
    expect(InstrumentationTestRegistry.didInitializeSDK).toEqual(true)
  })

  it("does not initialize the OpenTelemetry SDK when its config option is false", () => {
    client = new Client({
      ...DEFAULT_OPTS,
      active: true,
      initializeOpentelemetrySdk: false
    })
    expect(InstrumentationTestRegistry.didInitializeSDK).toEqual(false)
  })

  describe("Instrumentations", () => {
    it("registers the default instrumentations", () => {
      client = new Client({ ...DEFAULT_OPTS, active: true })
      // Not testing against all of them or a fixed number so
      // that we don't have to change these tests every time we
      // add a new instrumentation.
      const registryInstrumentationNames =
        InstrumentationTestRegistry.instrumentationNames()
      expect(registryInstrumentationNames.length).toBeGreaterThan(10)
      expect(registryInstrumentationNames).toContain(
        "@opentelemetry/instrumentation-http"
      )

      const opentelemetryInstrumentations =
        client.opentelemetryInstrumentations()
      expect(opentelemetryInstrumentations.length).toBeGreaterThan(10)
      expect(instrumentationNames(opentelemetryInstrumentations)).toContain(
        "@opentelemetry/instrumentation-http"
      )
    })

    it("can disable all default instrumentations", () => {
      client = new Client({
        ...DEFAULT_OPTS,
        active: true,
        disableDefaultInstrumentations: true
      })
      const instrumentationNames =
        InstrumentationTestRegistry.instrumentationNames()
      expect(instrumentationNames).toEqual([])
      expect(client.opentelemetryInstrumentations()).toEqual([])
    })

    it("can disable some default instrumentations", () => {
      client = new Client({
        ...DEFAULT_OPTS,
        active: true,
        disableDefaultInstrumentations: ["@opentelemetry/instrumentation-http"]
      })
      const registryInstrumentationNames =
        InstrumentationTestRegistry.instrumentationNames()
      expect(registryInstrumentationNames).not.toContain(
        "@opentelemetry/instrumentation-http"
      )
      expect(registryInstrumentationNames.length).toBeGreaterThan(10)

      const opentelemetryInstrumentations =
        client.opentelemetryInstrumentations()
      expect(instrumentationNames(opentelemetryInstrumentations)).not.toContain(
        "@opentelemetry/instrumentation-http"
      )
      expect(opentelemetryInstrumentations.length).toBeGreaterThan(10)
    })

    it("can add additional instrumentations", () => {
      class TestInstrumentation implements Instrumentation {
        instrumentationName = "test/instrumentation"
        instrumentationVersion = "0.0.0"
        enable() {
          // Does nothing
        }
        disable() {
          // Does nothing
        }
        setTracerProvider(_tracerProvider: any) {
          // Does nothing
        }
        setMeterProvider(_meterProvider: any) {
          // Does nothing
        }
        setConfig(_config: any) {
          // Does nothing
        }
        getConfig() {
          return {}
        }
      }

      client = new Client({
        ...DEFAULT_OPTS,
        active: true,
        additionalInstrumentations: [new TestInstrumentation()]
      })

      const registryInstrumentationNames =
        InstrumentationTestRegistry.instrumentationNames()
      expect(registryInstrumentationNames).toContain(
        "@opentelemetry/instrumentation-http"
      )
      expect(registryInstrumentationNames.length).toBeGreaterThan(10)
      expect(registryInstrumentationNames).toContain("test/instrumentation")
      const opentelemetryInstrumentations =
        client.opentelemetryInstrumentations()
      expect(instrumentationNames(opentelemetryInstrumentations)).toContain(
        "@opentelemetry/instrumentation-http"
      )
      expect(opentelemetryInstrumentations.length).toBeGreaterThan(10)
      expect(instrumentationNames(opentelemetryInstrumentations)).toContain(
        "test/instrumentation"
      )
    })
  })
})

import { Metrics, Probes } from "../interfaces"
import { BaseProbes } from "../probes"
import { BaseMetrics } from "../metrics"
import * as v8 from "../probes/v8"
import os from "os"
import { BaseClient } from "../client"

describe("Probes", () => {
  let probes: Probes

  beforeEach(() => {
    jest.useFakeTimers()
    probes = new BaseProbes()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  function registerMockProbe(): jest.Mock {
    const fn = jest.fn()
    probes.register("test_metric", fn)
    return fn
  }

  describe("when stopped", () => {
    it("is not running", () => {
      expect(probes.isRunning).toEqual(true)
      probes.stop()
      expect(probes.isRunning).toEqual(false)
    })

    it("does not register or call an already registered probe", () => {
      const fn = registerMockProbe()
      probes.stop()
      jest.runOnlyPendingTimers()
      expect(fn).not.toHaveBeenCalled()
      expect(probes.count).toEqual(0)
    })

    it("does not register or call a newly registered probe", () => {
      probes.stop()
      const fn = registerMockProbe()
      jest.runOnlyPendingTimers()
      expect(fn).not.toHaveBeenCalled()
      expect(probes.count).toEqual(0)
    })
  })

  it("registers a probe", () => {
    const fn = registerMockProbe()
    jest.runOnlyPendingTimers()
    expect(fn).toHaveBeenCalled()
    expect(probes.count).toEqual(1)
  })

  it("does not call a probe after it has been overwritten", () => {
    const first = registerMockProbe()
    const second = registerMockProbe()
    jest.runOnlyPendingTimers()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalled()
  })

  it("unregisters a probe", () => {
    const fn = registerMockProbe()
    probes.unregister("test_metric")
    jest.runOnlyPendingTimers()
    expect(fn).not.toHaveBeenCalled()
    expect(probes.count).toEqual(0)
  })

  describe("Metrics integration test", () => {
    function initialiseMetrics(enableMinutelyProbes: boolean = true) {
      const client = new BaseClient({
        active: true,
        pushApiKey: "TEST_API_KEY",
        enableMinutelyProbes
      })
      expect(client.metrics()).toBeInstanceOf(BaseMetrics)

      probes = client.metrics().probes()
    }

    it("calls probes when enableMinutelyProbes is true", () => {
      initialiseMetrics(true)
      const fn = registerMockProbe()
      jest.runOnlyPendingTimers()
      expect(fn).toHaveBeenCalled()
    })

    it("does not call probes when enableMinutelyProbes is false", () => {
      initialiseMetrics(false)
      const fn = registerMockProbe()
      jest.runOnlyPendingTimers()
      expect(fn).not.toHaveBeenCalled()
    })
  })

  describe("v8 probe", () => {
    let meterMock: Metrics
    let setGaugeMock: jest.Mock

    beforeEach(() => {
      setGaugeMock = jest.fn()

      meterMock = ({
        setGauge: setGaugeMock
      } as unknown) as Metrics
    })

    function registerV8Probe(hostname?: string) {
      new BaseClient({ hostname })

      let { PROBE_NAME, init } = v8
      probes.register(PROBE_NAME, init(meterMock))
    }

    it("reports v8 heap statistics with hostnames", () => {
      registerV8Probe("MyHostname")

      jest.runOnlyPendingTimers()

      let gaugeNames = [
        "nodejs_total_heap_size",
        "nodejs_total_heap_size_executable",
        "nodejs_total_physical_size",
        "nodejs_used_heap_size",
        "nodejs_malloced_memory",
        "nodejs_number_of_native_contexts",
        "nodejs_number_of_detached_contexts"
      ]

      gaugeNames.forEach(gaugeName => {
        expect(setGaugeMock).toBeCalledWith(gaugeName, expect.any(Number), {
          hostname: "MyHostname"
        })
      })
    })

    it("uses the system hostname if none is provided", () => {
      registerV8Probe()

      jest.runOnlyPendingTimers()

      expect(setGaugeMock).toBeCalledWith(
        expect.any(String),
        expect.any(Number),
        {
          hostname: os.hostname()
        }
      )
    })
  })
})

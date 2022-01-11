import { Metrics } from "../interfaces"
import { BaseProbes as Probes } from "../probes"
import * as v8 from "../probes/v8"
import os from "os"
import { BaseClient } from "../client"

describe("Probes", () => {
  let probes: Probes

  beforeEach(() => {
    jest.useFakeTimers()
    probes = new Probes()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it("registers a probe", () => {
    const fn = jest.fn()
    probes.register("test_metric", fn)
    jest.runOnlyPendingTimers()
    expect(fn).toHaveBeenCalled()
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
      new BaseClient({ hostname: hostname })

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

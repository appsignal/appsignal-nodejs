import { Client } from "../client"
import { Metrics } from "../metrics"

describe("Metrics", () => {
  let metrics: Metrics

  beforeEach(() => {
    new Client()
    metrics = new Metrics()
  })

  it("runs the probes when minutely probes are on", () => {
    expect(metrics.probes().isRunning).toEqual(true)
  })

  it("does not run the probes when minutely probes are off", () => {
    new Client({ enableMinutelyProbes: false })
    metrics = new Metrics()
    expect(metrics.probes().isRunning).toEqual(false)
  })

  it("sets a gauge", () => {
    expect(() => {
      metrics.setGauge("database_size", 100)
    }).not.toThrow()
  })

  it("sets a distribution value", () => {
    expect(() => {
      metrics.addDistributionValue("memory_usage", 100)
    }).not.toThrow()
  })

  it("increments the counter", () => {
    expect(() => {
      metrics.incrementCounter("login_count", 1)
    }).not.toThrow()
  })
})

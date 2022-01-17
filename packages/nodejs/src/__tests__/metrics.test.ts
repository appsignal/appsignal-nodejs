import { BaseClient } from "../client"
import { BaseMetrics as Metrics } from "../metrics"
import { NoopProbes } from "../noops"
import { BaseProbes } from "../probes"

describe("Metrics", () => {
  let metrics: Metrics

  beforeEach(() => {
    new BaseClient()
    metrics = new Metrics()
  })

  it("has `Probes` when minutely probes are on", () => {
    expect(metrics.probes()).toBeInstanceOf(BaseProbes)
  })

  it("has `NoopProbes` when minutely probes are off", () => {
    new BaseClient({ enableMinutelyProbes: false })
    metrics = new Metrics()
    expect(metrics.probes()).toBeInstanceOf(NoopProbes)
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

import { BaseMetrics as Metrics } from "../metrics"

describe("Metrics", () => {
  let metrics: Metrics

  beforeEach(() => {
    metrics = new Metrics()
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

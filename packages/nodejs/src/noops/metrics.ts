import { Metrics } from "../interfaces/metrics"

export class NoopMetrics implements Metrics {
  public setGauge(
    key: string,
    value: number,
    tags?: { [key: string]: string | number | boolean }
  ): this {
    return this
  }

  public addDistributionValue(
    key: string,
    value: number,
    tags?: { [key: string]: string | number | boolean }
  ): this {
    return this
  }

  public incrementCounter(
    key: string,
    value: number,
    tags?: { [key: string]: string | number | boolean }
  ): this {
    return this
  }
}

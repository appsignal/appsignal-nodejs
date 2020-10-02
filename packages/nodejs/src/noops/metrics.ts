import { Metrics } from "../interfaces/metrics"
import { Probes } from "../probes"

export class NoopMetrics implements Metrics {
  #probes = new Probes()

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

  public probes(): Probes {
    return this.#probes
  }
}

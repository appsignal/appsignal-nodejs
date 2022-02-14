import { Metrics, Probes } from "../interfaces"
import { BaseProbes } from "../probes"

export class NoopMetrics implements Metrics {
  #probes = new BaseProbes({ run: false })

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

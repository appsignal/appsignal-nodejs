import { Metrics, Probes } from "../interfaces"
import { BaseProbes } from "../probes"

export class NoopMetrics implements Metrics {
  #probes = new BaseProbes({ run: false })

  public setGauge(
    _key: string,
    _value: number,
    _tags?: { [key: string]: string | number | boolean }
  ): this {
    return this
  }

  public addDistributionValue(
    _key: string,
    _value: number,
    _tags?: { [key: string]: string | number | boolean }
  ): this {
    return this
  }

  public incrementCounter(
    _key: string,
    _value: number,
    _tags?: { [key: string]: string | number | boolean }
  ): this {
    return this
  }

  public probes(): Probes {
    return this.#probes
  }
}

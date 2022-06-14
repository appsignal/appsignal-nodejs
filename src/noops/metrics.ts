import { Metrics } from "../metrics"
import { Probes } from "../probes"

export class NoopMetrics extends Metrics {
  #probes = new Probes({ run: false })

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

// the C++ extension is loaded here (via commonjs for compatibility).
// we keep this as a locally scoped variable; the C++ bindings
// should not be visible publicly.
const { metrics } = require("../build/Release/extension.node")

import { DataArray, DataMap } from "./internal"

/**
 * The metrics object.
 *
 * @class
 */
export class Metrics {
  /**
   * A gauge is a metric value at a specific time. If you set more
   * than one gauge with the same key, the latest value for that
   * moment in time is persisted.
   *
   * Gauges are used for things like tracking sizes of databases, disks,
   * or other absolute values like CPU usage, a numbers of items (users,
   * accounts, etc.). Currently all AppSignal host metrics are stored
   * as gauges.
   */
  public setGauge(
    key: string,
    value: number,
    tags?: { [key: string]: string | number | boolean }
  ) {
    if (!key || !value) return this

    metrics.setGauge(
      key,
      value,
      tags && Array.isArray(tags)
        ? new DataArray(tags)?.ref
        : new DataMap(tags)?.ref
    )

    return this
  }

  /**
   * Measurements are used for things like response times. We allow you to
   * track a metric with wildly varying values over time and create graphs
   * based on their average value or call count during that time.
   *
   * By tracking a measurement, the average and count will be persisted for
   * the metric. A measurement metric creates several metric fields:
   *
   * - `COUNT`, which counts how many times the helper was called
   * - `MEAN`, the average metric value for the point in time.
   * - `P90`, the 90th percentile of the metric value for the point in time.
   * - `P95`, the 95th percentile of the metric value for the point in time.
   */
  public addDistributionValue(
    key: string,
    value: number,
    tags?: { [key: string]: string | number | boolean }
  ) {
    if (!key || !value) return this

    metrics.addDistributionValue(
      key,
      value,
      tags && Array.isArray(tags)
        ? new DataArray(tags)?.ref
        : new DataMap(tags)?.ref
    )

    return this
  }

  /**
   * The counter metric type stores a number value for a given time frame. These
   * counter values are combined into a total count value for the display time
   * frame resolution. This means that when viewing a graph with a minutely
   * resolution it will combine the values of the given minute, and for the
   * hourly resolution combines the values of per hour.
   *
   * Counters are good to use to track events. With a gauge you can track how
   * many of something (users, comments, etc.) there is at a certain time, but
   * with events you can track how many events occurred at a specific time
   * (users signing in, comments being made, etc.).
   *
   * When this method is called multiple times, the total/sum of all calls is persisted.
   */
  public incrementCounter(
    key: string,
    value: number,
    tags?: { [key: string]: string | number | boolean }
  ) {
    if (!key || !value) return this

    metrics.incrementCounter(
      key,
      value,
      tags && Array.isArray(tags)
        ? new DataArray(tags)?.ref
        : new DataMap(tags)?.ref
    )

    return this
  }
}

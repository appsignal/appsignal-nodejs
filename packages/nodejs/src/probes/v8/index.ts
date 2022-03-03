import { Metrics } from "../../interfaces"
import v8 from "v8"
import os from "os"
import { BaseClient } from "../../client"

export const PROBE_NAME = "v8_stats"

export function init(meter: Metrics) {
  function setGauge(key: string, value: number) {
    const hostname = BaseClient.config.data.hostname || os.hostname()
    meter.setGauge(key, value, { hostname })
  }

  return function () {
    const {
      total_heap_size,
      total_heap_size_executable,
      total_physical_size,
      used_heap_size,
      malloced_memory,
      number_of_native_contexts,
      number_of_detached_contexts
    } = v8.getHeapStatistics()

    setGauge("nodejs_total_heap_size", total_heap_size)
    setGauge("nodejs_total_heap_size_executable", total_heap_size_executable)
    setGauge("nodejs_total_physical_size", total_physical_size)
    setGauge("nodejs_used_heap_size", used_heap_size)
    setGauge("nodejs_malloced_memory", malloced_memory)
    setGauge("nodejs_number_of_native_contexts", number_of_native_contexts)
    setGauge("nodejs_number_of_detached_contexts", number_of_detached_contexts)
  }
}

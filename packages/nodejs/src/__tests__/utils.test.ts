import { getAgentTimestamps, hrTime } from "../utils"
import perf_hooks from "perf_hooks"

describe("Utils", () => {
  describe("getAgentTimestamps", () => {
    it("calculates the timeestamp", () => {
      const timestamp = getAgentTimestamps(1_589_192_966_108)

      expect(timestamp.sec).toEqual(1_589_192_966)
      expect(timestamp.nsec).toEqual(108000000)
    })
  })

  describe("hrTime", () => {
    it("returns a second/nanosecond tuple", () => {
      const performance = {
        timeOrigin: 1648719688126.149,
        now: function () {
          return 116931.83823999763
        },
        clearMarks: perf_hooks.performance.clearMarks,
        mark: perf_hooks.performance.mark,
        measure: perf_hooks.performance.measure,
        nodeTiming: perf_hooks.performance.nodeTiming,
        timerify: perf_hooks.performance.timerify,
        eventLoopUtilization: perf_hooks.performance.eventLoopUtilization
      }

      expect(hrTime(performance)).toEqual({
        sec: 1648719688 + 116,
        nsec: 126148939 + 931838240
      })
    })
  })
})

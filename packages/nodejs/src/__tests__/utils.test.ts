import { getAgentTimestamps } from "../utils"

describe("Utils", () => {
  describe("getAgentTimestamps", () => {
    it("calculates the timeestamp", () => {
      const timestamp = getAgentTimestamps(1_589_192_966_108)

      expect(timestamp.sec).toEqual(1_589_192_966)
      expect(timestamp.nsec).toEqual(108000000)
    })
  })
})

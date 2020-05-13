import { Probes } from "../probes"

describe("Probes", () => {
  let probes: Probes

  beforeEach(() => {
    jest.useFakeTimers()
    probes = new Probes()
  })

  afterEach(() => {
    jest.clearAllTimers()
  })

  it("registers a probe", () => {
    const fn = jest.fn()
    probes.register("test_metric", fn)
    jest.runOnlyPendingTimers()
    expect(fn).toHaveBeenCalled()
  })
})

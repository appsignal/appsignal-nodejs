import { Metrics } from "../interfaces"
import { Instrumentation } from "../instrument"
import { initCorePlugins, initCoreProbes } from "../bootstrap"

describe("Bootstrap", () => {
  describe("Plugins", () => {
    const mock = ({
      load: jest.fn()
    } as unknown) as Instrumentation

    it("bootstraps the core instumentation plugins", () => {
      initCorePlugins(mock, { ignoreInstrumentation: undefined })
      expect(mock.load).toHaveBeenCalledTimes(4)
    })

    it("can ignore a core instumentation plugin", () => {
      initCorePlugins(mock, { ignoreInstrumentation: ["http"] })

      expect(mock.load).toHaveBeenCalledTimes(3)
      expect((mock.load as any).mock.calls.map((m: any) => m[0])).not.toContain(
        "http"
      )
    })
  })

  describe("Probes", () => {
    const registerMock = jest.fn()
    let mock: Metrics

    beforeEach(() => {
      mock = ({
        probes: jest.fn().mockImplementation(() => ({
          register: registerMock
        }))
      } as unknown) as Metrics
    })

    it("bootstraps the core probes", () => {
      initCoreProbes(mock)
      expect(registerMock).toHaveBeenCalledTimes(1)
    })
  })
})

import { Metrics } from "../interfaces"
import { Instrumentation } from "../instrument"
import { initCorePlugins, initCoreProbes } from "../bootstrap"

describe("Bootstrap", () => {
  describe("Plugins", () => {
    const mock = ({
      load: jest.fn()
    } as unknown) as Instrumentation

    beforeEach(() => {
      jest.clearAllMocks()
    })

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

    const mock = ({
      probes: jest.fn().mockImplementation(() => ({
        register: registerMock
      }))
    } as unknown) as Metrics

    beforeEach(() => {
      jest.clearAllMocks()
    })

    it("bootstraps the core probes", () => {
      initCoreProbes(mock, { enableMinutelyProbes: true })
      expect(registerMock).toHaveBeenCalledTimes(1)
    })

    it("doesn't bootstrap the core probes if enableMinutelyProbes is false", () => {
      initCoreProbes(mock, { enableMinutelyProbes: false })
      expect(registerMock).toHaveBeenCalledTimes(0)
    })
  })
})

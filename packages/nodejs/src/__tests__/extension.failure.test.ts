import { Extension } from "../extension"

describe("Extension", () => {
  let ext: Extension

  beforeEach(() => {
    ext = new Extension()
  })

  afterEach(() => {
    ext.stop()
  })

  it("is not loaded", () => {
    expect(Extension.isLoaded).toEqual(false)
  })

  it("does not start the client", () => {
    const warnSpy = jest.spyOn(console, "warn")
    expect(() => {
      ext.start()
    }).not.toThrow()
    expect(warnSpy).toHaveBeenLastCalledWith(
      "AppSignal extension not loaded. This could mean that your current environment isn't supported, or that another error has occurred."
    )
  })

  it("does not error on stopping the client", () => {
    expect(() => {
      ext.stop()
    }).not.toThrow()
  })
})

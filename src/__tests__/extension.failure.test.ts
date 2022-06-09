import { Extension } from "../extension"

describe("Extension", () => {
  let ext: Extension

  beforeEach(() => {
    ext = new Extension()
  })

  afterEach(() => {
    ext.stop()
  })

  it("logs a warning when the module is required", () => {
    const errorSpy = jest.spyOn(console, "error")

    jest.resetModules()
    require("../extension")

    expect(errorSpy).toHaveBeenLastCalledWith(
      "AppSignal extension not loaded. This could mean that your current " +
        "environment isn't supported, or that another error has occurred."
    )
  })

  it("is not loaded", () => {
    expect(Extension.isLoaded).toEqual(false)
  })

  it("does not start the client", () => {
    expect(() => {
      ext.start()
    }).not.toThrow()
  })

  it("does not error on stopping the client", () => {
    expect(() => {
      ext.stop()
    }).not.toThrow()
  })

  it("does not error on diagnoseRaw", () => {
    expect(ext.diagnose()).toMatchObject({
      error: expect.any(Error),
      output: [""]
    })
  })

  it("does not error on runningInContainer", () => {
    expect(ext.runningInContainer()).toBeUndefined()
  })
})

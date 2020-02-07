import { Extension } from "../extension"

describe("Extension", () => {
  let ext: Extension

  beforeEach(() => {
    ext = new Extension({})
  })

  it("starts the client", () => {
    expect(() => {
      ext.start()
    }).not.toThrow()

    expect(ext.isLoaded).toBeTruthy()
  })

  it("stops the client", () => {
    expect(() => {
      ext.stop()
    }).not.toThrow()

    expect(ext.isLoaded).toBeFalsy()
  })

  it("starts the client when the active option is true", () => {
    expect(() => {
      ext = new Extension({ active: true })
    }).not.toThrow()

    expect(ext.isLoaded).toBeTruthy()
  })
})

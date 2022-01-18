import { Extension } from "../extension"

describe("Extension", () => {
  let ext: Extension

  beforeEach(() => {
    ext = new Extension()
  })

  afterEach(() => {
    ext.stop()
  })

  it("is loaded", () => {
    expect(Extension.isLoaded).toEqual(true)
  })

  it("starts the client", () => {
    expect(() => {
      ext.start()
    }).not.toThrow()
  })

  it("stops the client", () => {
    expect(() => {
      ext.stop()
    }).not.toThrow()
  })
})

import { Extension } from "../extension"

describe("Extension", () => {
  let ext: Extension

  beforeEach(() => {
    ext = new Extension({})
  })

  it("starts the client", () => {
    ext.start()
    expect(ext.isLoaded).toBeTruthy()
  })

  it("stops the client", () => {
    ext.stop()
    expect(ext.isLoaded).toBeFalsy()
  })

  it("starts the client when the active option is true", () => {
    ext = new Extension({ active: true })
    expect(ext.isLoaded).toBeTruthy()
  })
})

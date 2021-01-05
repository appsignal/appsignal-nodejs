import { Agent } from "../agent"

describe("Extension", () => {
  let ext: Agent

  beforeEach(() => {
    ext = new Agent()
  })

  afterEach(() => {
    ext.stop()
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
      ext = new Agent({ active: true })
    }).not.toThrow()

    expect(ext.isLoaded).toBeTruthy()
  })
})

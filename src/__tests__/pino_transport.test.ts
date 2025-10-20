const pinoTransport = require("../pino_transport")
const { Extension } = require("../extension")

jest.mock("../extension")

describe("pino transport", () => {
  it("handles undefined message", async () => {
    const extensionMock = {
      log: jest.fn()
    }

    Extension.mockImplementation(() => extensionMock)

    const transport = pinoTransport({ group: "test" })

    const done = new Promise((resolve, reject) => {
      transport.on("finish", resolve)
      transport.on("error", reject)
    })

    transport.write('{"level":30,"foo":"bar"}\n')
    transport.end()

    await done

    await new Promise(r => setTimeout(r, 1000))

    expect(extensionMock.log).toHaveBeenCalledWith(
      "test",
      expect.any(Number),
      expect.any(Number),
      "",
      { foo: "bar" }
    )
  })
})

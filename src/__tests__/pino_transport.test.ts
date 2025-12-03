import pinoTransport from "../pino_transport"
import { Extension } from "../extension"
import { expect, jest } from "@jest/globals"
import { LOGGER_FORMAT, LOGGER_LEVEL_SEVERITY } from "../logger"

jest.mock("../extension")
const MockedExtension = jest.mocked(Extension)

describe("pino transport", () => {
  let transport: any

  beforeEach(() => {
    MockedExtension.mockReset()
    transport = pinoTransport({ group: "groupname" })
  })

  afterEach(() => transport?.end())

  it("handles logs with a message", async () => {
    await fakeLog(transport, { level: 30, foo: "bar", msg: "a message" })

    const extension = MockedExtension.mock.instances[0]
    expect(extension.log).toHaveBeenCalledWith(
      "groupname",
      expect.any(Number),
      expect.any(Number),
      "a message",
      { foo: "bar" }
    )
  })

  it("handles logs without a message", async () => {
    await fakeLog(transport, { level: 30, foo: "bar" })

    const extension = MockedExtension.mock.instances[0]
    expect(extension.log).toHaveBeenCalledWith(
      "groupname",
      LOGGER_LEVEL_SEVERITY.info,
      LOGGER_FORMAT.autodetect,
      "",
      { foo: "bar" }
    )
  })

  it("flattens arguments", async () => {
    await fakeLog(transport, {
      level: 30,
      msg: "a message",
      string: "abc",
      object: {
        string: "abc"
      },
      nested_object: {
        another_object: {
          string: "abc"
        }
      }
    })

    const extension = MockedExtension.mock.instances[0]
    expect(extension.log).toHaveBeenCalledWith(
      "groupname",
      LOGGER_LEVEL_SEVERITY.info,
      LOGGER_FORMAT.autodetect,
      "a message",
      {
        string: "abc",
        "object.string": "abc",
        "nested_object.another_object.string": "abc"
      }
    )
  })

  it("handles null values in attributes", async () => {
    await fakeLog(transport, {
      level: 30,
      msg: "a message",
      null_value: null,
      nested: {
        null_value: null,
        normal_value: "foo"
      }
    })

    const extension = MockedExtension.mock.instances[0]
    expect(extension.log).toHaveBeenCalledWith(
      "groupname",
      LOGGER_LEVEL_SEVERITY.info,
      LOGGER_FORMAT.autodetect,
      "a message",
      {
        null_value: null,
        "nested.null_value": null,
        "nested.normal_value": "foo"
      }
    )
  })

  it('treats "fatal" as "error" level', async () => {
    await fakeLog(transport, {
      level: 60,
      msg: "Fatal error"
    })

    const extension = MockedExtension.mock.instances[0]
    expect(extension.log).toHaveBeenCalledTimes(1)
    expect(extension.log).toHaveBeenCalledWith(
      "groupname",
      LOGGER_LEVEL_SEVERITY.error,
      LOGGER_FORMAT.autodetect,
      "Fatal error",
      {}
    )
  })

  it("maps log level boundaries correctly", async () => {
    await fakeLog(transport, { level: 19, msg: "below debug" })
    await fakeLog(transport, { level: 29, msg: "below info" })
    await fakeLog(transport, { level: 39, msg: "below warn" })
    await fakeLog(transport, { level: 49, msg: "below error" })
    await fakeLog(transport, { level: 50, msg: "error" })
    await fakeLog(transport, { level: 60, msg: "fatal" })

    const extension = MockedExtension.mock.instances[0]
    expect(extension.log).toHaveBeenCalledTimes(6)

    expect(extension.log).toHaveBeenNthCalledWith(
      1,
      "groupname",
      LOGGER_LEVEL_SEVERITY.trace,
      LOGGER_FORMAT.autodetect,
      "below debug",
      {}
    )
    expect(extension.log).toHaveBeenNthCalledWith(
      2,
      "groupname",
      LOGGER_LEVEL_SEVERITY.debug,
      LOGGER_FORMAT.autodetect,
      "below info",
      {}
    )
    expect(extension.log).toHaveBeenNthCalledWith(
      3,
      "groupname",
      LOGGER_LEVEL_SEVERITY.info,
      LOGGER_FORMAT.autodetect,
      "below warn",
      {}
    )
    expect(extension.log).toHaveBeenNthCalledWith(
      4,
      "groupname",
      LOGGER_LEVEL_SEVERITY.warn,
      LOGGER_FORMAT.autodetect,
      "below error",
      {}
    )
    expect(extension.log).toHaveBeenNthCalledWith(
      5,
      "groupname",
      LOGGER_LEVEL_SEVERITY.error,
      LOGGER_FORMAT.autodetect,
      "error",
      {}
    )
    expect(extension.log).toHaveBeenNthCalledWith(
      6,
      "groupname",
      LOGGER_LEVEL_SEVERITY.error,
      LOGGER_FORMAT.autodetect,
      "fatal",
      {}
    )
  })
})

async function fakeLog(transport: any, json: any): Promise<unknown> {
  transport.write(`${JSON.stringify(json)}\n`)

  return new Promise(resolve => setImmediate(resolve))
}

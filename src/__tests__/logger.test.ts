import { Client } from "../client"
import { BaseLogger, LoggerFormat, LoggerLevel } from "../logger"

describe("BaseLogger", () => {
  let logger: BaseLogger
  let client: Client

  beforeAll(() => {
    client = new Client({
      name: "TEST APP",
      pushApiKey: "PUSH_API_KEY"
    })
  })

  beforeEach(() => {
    client.extension.log = jest.fn()
    client.internalLogger.warn = jest.fn()
    logger = new BaseLogger(client, "groupname")
  })

  it("defaults to an info logger level", () => {
    expect(logger.severityThreshold).toEqual(3)
    expect(client.internalLogger.warn).not.toHaveBeenCalled()
  })

  it("sets an info logger level when the severity is unknown and logs a warning", () => {
    logger = new BaseLogger(client, "groupname", "bacon" as LoggerLevel)
    expect(logger.severityThreshold).toEqual(3)
    expect(client.internalLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining(`"bacon"`)
    )
  })

  it("sets the right severity threshold for a known logger level", () => {
    expect(
      new BaseLogger(client, "groupname", "trace").severityThreshold
    ).toEqual(1)
    expect(
      new BaseLogger(client, "groupname", "debug").severityThreshold
    ).toEqual(2)
    expect(
      new BaseLogger(client, "groupname", "info").severityThreshold
    ).toEqual(3)
    expect(
      new BaseLogger(client, "groupname", "log").severityThreshold
    ).toEqual(4)
    expect(
      new BaseLogger(client, "groupname", "warn").severityThreshold
    ).toEqual(5)
    expect(
      new BaseLogger(client, "groupname", "error").severityThreshold
    ).toEqual(6)
  })

  it("defaults to a plaintext logger format", () => {
    expect(logger.format).toEqual(0)
    expect(client.internalLogger.warn).not.toHaveBeenCalled()
  })

  it("sets a plaintext format level when the format is unknown and logs a warning", () => {
    logger = new BaseLogger(
      client,
      "groupname",
      "trace" as LoggerLevel,
      "bacon" as LoggerFormat
    )
    expect(logger.format).toEqual(0)
    expect(client.internalLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining(`"bacon"`)
    )
  })

  it("sets the right format for a known logger format", () => {
    expect(
      new BaseLogger(client, "groupname", "trace", "plaintext").format
    ).toEqual(0)
    expect(
      new BaseLogger(client, "groupname", "trace", "logfmt").format
    ).toEqual(1)
    expect(new BaseLogger(client, "groupname", "trace", "json").format).toEqual(
      2
    )
  })

  it("logs to the extension if at or above the logger level", () => {
    const attributes = { foo: "bar", number: 42, isAnswer: true }

    logger.trace("trace message", attributes)
    logger.debug("debug message", attributes)
    logger.info("info message", attributes)
    logger.log("log message", attributes)
    logger.warn("warn message", attributes)
    logger.error("error message", attributes)

    expect(client.extension.log).toHaveBeenCalledTimes(4)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      0,
      "info message",
      attributes
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      4,
      0,
      "log message",
      attributes
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      5,
      0,
      "warn message",
      attributes
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      6,
      0,
      "error message",
      attributes
    )
  })

  it("logs to the extension if at or above the logger level with a format", () => {
    logger = new BaseLogger(client, "groupname", "info", "logfmt")

    logger.info("info message")

    expect(client.extension.log).toHaveBeenCalledTimes(1)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      1,
      "info message",
      {}
    )
  })
})

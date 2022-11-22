import { Client } from "../client"
import { Logger, LoggerLevel } from "../logger"

describe("Logger", () => {
  let logger: Logger
  let client: Client

  beforeAll(() => {
    client = new Client({
      name: "TEST APP",
      pushApiKey: "PUSH_API_KEY"
    })
  })

  beforeEach(() => {
    client.extension.log = jest.fn()
    client.integrationLogger.warn = jest.fn()
    logger = client.logger("groupname")
  })

  it("defaults to an info logger level", () => {
    expect(logger.severityThreshold).toEqual(3)
    expect(client.integrationLogger.warn).not.toHaveBeenCalled()
  })

  it("sets an info logger level when the severity is unknown and logs a warning", () => {
    logger = client.logger("groupname", "bacon" as LoggerLevel)
    expect(logger.severityThreshold).toEqual(3)
    expect(client.integrationLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining(`"bacon"`)
    )
  })

  it("sets the right severity threshold for a known logger level", () => {
    expect(client.logger("groupname", "trace").severityThreshold).toEqual(1)
    expect(client.logger("groupname", "debug").severityThreshold).toEqual(2)
    expect(client.logger("groupname", "info").severityThreshold).toEqual(3)
    expect(client.logger("groupname", "log").severityThreshold).toEqual(4)
    expect(client.logger("groupname", "warn").severityThreshold).toEqual(5)
    expect(client.logger("groupname", "error").severityThreshold).toEqual(6)
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
      "info message",
      attributes
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      4,
      "log message",
      attributes
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      5,
      "warn message",
      attributes
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      6,
      "error message",
      attributes
    )
  })
})

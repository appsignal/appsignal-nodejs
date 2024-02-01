import { BaseInternalLogger } from "../internal_logger"

describe("BaseInternalLogger", () => {
  let logger: BaseInternalLogger

  beforeEach(() => {
    logger = new BaseInternalLogger("stdout", "trace")
  })

  it("sends errors to winston", () => {
    const errMock = jest.spyOn(logger.logger, "error")
    logger.error("Hi, I'm error")

    expect(errMock).toBeCalledWith("Hi, I'm error")
  })

  it("sends warnings to winston", () => {
    const warnMock = jest.spyOn(logger.logger, "warn")
    logger.warn("Hi, I'm warning")

    expect(warnMock).toBeCalledWith("Hi, I'm warning")
  })

  it("sends info to winston", () => {
    const infoMock = jest.spyOn(logger.logger, "info")
    logger.info("Hi, I'm info")

    expect(infoMock).toBeCalledWith("Hi, I'm info")
  })

  it("sends debugs to winston", () => {
    const debugMock = jest.spyOn(logger.logger, "debug")
    logger.debug("Hi, I'm debug")

    expect(debugMock).toBeCalledWith("Hi, I'm debug")
  })

  it("sends traces to winston", () => {
    const sillyMock = jest.spyOn(logger.logger, "silly")
    logger.trace("Hi, I'm trace")

    expect(sillyMock).toBeCalledWith("Hi, I'm trace")
  })

  it("sets the proper npm log levels from our log levels", () => {
    logger = new BaseInternalLogger("stdout", "error")
    expect(logger.level).toEqual("error")

    logger = new BaseInternalLogger("stdout", "warning")
    expect(logger.level).toEqual("warn")

    logger = new BaseInternalLogger("stdout", "info")
    expect(logger.level).toEqual("info")

    logger = new BaseInternalLogger("stdout", "debug")
    expect(logger.level).toEqual("debug")

    logger = new BaseInternalLogger("stdout", "trace")
    expect(logger.level).toEqual("silly")

    logger = new BaseInternalLogger("stdout", "fooBarBaz")
    expect(logger.level).toEqual("info")
  })
})

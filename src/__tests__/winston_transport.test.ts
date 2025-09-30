import { Client } from "../client"
import { WinstonTransport } from "../winston_transport"
import { Logger, createLogger, format, config } from "winston"

const transports = () => [
  new WinstonTransport({
    group: "groupname"
  })
]

describe("BaseLogger", () => {
  let client: Client
  let logger: Logger

  beforeAll(() => {
    client = new Client({
      active: true,
      name: "TEST APP",
      pushApiKey: "PUSH_API_KEY"
    })
  })

  afterAll(async () => {
    await client.stop()
  })

  beforeEach(() => {
    logger = createLogger({ transports: transports() })

    client.extension.log = jest.fn()
  })

  it("groups multiple arguments into message and attributes", () => {
    logger.info("some data", { foo: 123 }, "and some more data", { bar: 456 })
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "some data and some more data",
      { foo: 123, bar: 456 }
    )
  })

  it("carries arguments passed to child loggers", () => {
    const childLogger = logger.child({ child: "foo", group: "childgroup" })
    childLogger.info("child logger message", { argument: 123 })
    expect(client.extension.log).toHaveBeenCalledWith(
      "childgroup",
      3,
      3,
      "child logger message",
      { child: "foo", argument: 123 }
    )
  })

  it("ignores object keys with non-flat values", () => {
    logger.info(
      "no nested keys",
      { argument: 123, ignore: ["nested"] },
      { also: { ignore: "me" } }
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "no nested keys",
      { argument: 123 }
    )
  })

  it("ignores arrays", () => {
    logger.info("no arrays", ["foo", "bar"], ["baz"], { argument: 123 })
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "no arrays",
      { argument: 123 }
    )
  })

  it("is not affected by the colorize formatter", () => {
    const logger = createLogger({
      format: format.colorize(),
      transports: transports()
    })

    logger.info("no color for me", { argument: 123 })
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "no color for me",
      { argument: 123 }
    )
  })

  it("is not affected by the timestamp formatter", () => {
    const logger = createLogger({
      format: format.timestamp(),
      transports: transports()
    })
    logger.info("no timestamp for me", { argument: 123 })
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "no timestamp for me",
      { argument: 123 }
    )
  })

  it("defaults to an info logger level", () => {
    logger.info("info message")
    logger.http("http message") // http < info, will be ignored

    expect(client.extension.log).toHaveBeenCalledTimes(1)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "info message",
      {}
    )
  })

  it("can set logger level by transport", () => {
    const logger = createLogger({
      transports: [
        new WinstonTransport({
          group: "groupname",
          level: "silly"
        })
      ]
    })

    logger.silly("silly message") // below default threshold

    expect(client.extension.log).toHaveBeenCalledTimes(1)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      1,
      3,
      "silly message",
      {}
    )
  })

  it("treats unknown log levels as info", () => {
    const logger = createLogger({
      levels: {
        foobar: 1
      },
      level: "foobar",
      transports: transports()
    })
    logger.log("foobar", "foobar message")
    expect(client.extension.log).toHaveBeenCalledTimes(1)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "foobar message",
      {}
    )
  })

  it("logs with all rust logger levels except log", () => {
    const logger = createLogger({
      levels: {
        trace: 6,
        debug: 5,
        info: 4,
        warn: 2,
        error: 1
      },
      level: "trace",
      transports: transports()
    })

    logger.log("trace", "trace message")
    logger.log("debug", "debug message")
    logger.log("info", "info message")
    logger.log("warn", "warn message")
    logger.log("error", "error message")

    expect(client.extension.log).toHaveBeenCalledTimes(5)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      1,
      3,
      "trace message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      2,
      3,
      "debug message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "info message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      5,
      3,
      "warn message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      6,
      3,
      "error message",
      {}
    )
  })

  it("logs with all npm logger levels", () => {
    const logger = createLogger({
      level: "silly",
      transports: transports()
    })

    logger.silly("silly message")
    logger.debug("debug message")
    logger.verbose("verbose message")
    logger.http("http message")
    logger.info("info message")
    logger.warn("warn message")
    logger.error("error message")

    expect(client.extension.log).toHaveBeenCalledTimes(7)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      1,
      3,
      "silly message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      2,
      3,
      "debug message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      2,
      3,
      "verbose message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "http message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "http message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      5,
      3,
      "warn message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      6,
      3,
      "error message",
      {}
    )
  })

  it("logs with all syslog logger levels", () => {
    const logger = createLogger({
      level: "debug",
      levels: config.syslog.levels,
      transports: transports()
    })

    logger.emerg("emerg message")
    logger.alert("alert message")
    logger.crit("crit message")
    logger.error("error message")
    logger.warning("warning message")
    logger.notice("notice message")
    logger.info("info message")
    logger.debug("debug message")

    expect(client.extension.log).toHaveBeenCalledTimes(8)
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      9,
      3,
      "emerg message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      8,
      3,
      "alert message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      7,
      3,
      "crit message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      6,
      3,
      "error message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      5,
      3,
      "warning message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      4,
      3,
      "notice message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      3,
      3,
      "info message",
      {}
    )
    expect(client.extension.log).toHaveBeenCalledWith(
      "groupname",
      2,
      3,
      "debug message",
      {}
    )
  })
})

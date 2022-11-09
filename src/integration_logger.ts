import winston from "winston"
const { combine, timestamp, printf } = winston.format

export class IntegrationLogger {
  type: string
  level: string
  logger: winston.Logger

  constructor(type: string, level: string, filename?: string) {
    this.type = type
    this.level = this.translateLogLevel(level)

    let transport

    if (type == "file") {
      transport = new winston.transports.File({ filename: filename })
    } else {
      transport = new winston.transports.Console()
    }

    const logFormat = printf(({ level, message, timestamp }) => {
      if (type == "file") {
        return `[${timestamp} (process) #${process.pid}][${level}] ${message}`
      } else {
        return `[${timestamp} (process) #${process.pid}][appsignal][${level}] ${message}`
      }
    })

    this.logger = winston.createLogger({
      format: combine(timestamp({ format: "YYYY-MM-DDTHH:mm:ss" }), logFormat),
      level: this.level,
      transports: [transport]
    })
  }

  public error(message: string) {
    this.logger.error(message)
  }

  public warn(message: string) {
    this.logger.warn(message)
  }

  public info(message: string) {
    this.logger.info(message)
  }

  public debug(message: string) {
    this.logger.debug(message)
  }

  public trace(message: string) {
    this.logger.silly(message)
  }

  /**
   * Translates our logLevel to the one supported by Winston
   */
  private translateLogLevel(level: string): string {
    switch (level) {
      case "error":
        return "error"
      case "warning":
        return "warn"
      case "info":
        return "info"
      case "debug":
        return "debug"
      case "trace":
        return "silly"
      default:
        return "info"
    }
  }
}

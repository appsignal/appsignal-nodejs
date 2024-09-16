import { Client } from "./client"
import { internal as checkIn } from "./check_in"
export type { Event, EventKind } from "./check_in/event"

type OnceFn = {
  (): void
  reset(): void
}

function once<T extends (...args: any[]) => void>(
  fn: T,
  ...args: Parameters<T>
): OnceFn {
  let done = false

  const onceFn = function () {
    if (!done) {
      fn(...args)
      done = true
    }
  }

  onceFn.reset = () => {
    done = false
  }

  return onceFn
}

function consoleAndLoggerWarn(message: string) {
  console.warn(`appsignal WARNING: ${message}`)
  Client.internalLogger.warn(message)
}

export namespace internal {
  export const heartbeatClassWarnOnce = once(
    consoleAndLoggerWarn,
    "The class `Heartbeat` has been deprecated. " +
      "Please update uses of the class `new Heartbeat(...)` to `new checkIn.Cron(...)`, " +
      'importing it as `import { checkIn } from "@appsignal/nodejs"`, ' +
      "in order to remove this message."
  )

  export const heartbeatHelperWarnOnce = once(
    consoleAndLoggerWarn,
    "The helper `heartbeat` has been deprecated. " +
      "Please update uses of the helper `heartbeat(...)` to `checkIn.cron(...)`, " +
      'importing it as `import { checkIn } from "@appsignal/nodejs"`, ' +
      "in order to remove this message."
  )
}

export function heartbeat(name: string): void
export function heartbeat<T>(name: string, fn: () => T): T
export function heartbeat<T>(name: string, fn?: () => T): T | undefined {
  internal.heartbeatHelperWarnOnce()

  return (checkIn.cron as (name: string, fn?: () => T) => T | undefined)(name, fn)
}

export const Heartbeat = new Proxy(checkIn.Cron, {
  construct(target, args: ConstructorParameters<typeof checkIn.Cron>) {
    internal.heartbeatClassWarnOnce()

    return new target(...args)
  }
})

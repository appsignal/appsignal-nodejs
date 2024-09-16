import { scheduler } from "./scheduler"

import { internal as internalCron } from "./cron"

import { Event } from "./event"

import { heartbeatInterval, addContinuousHeartbeat } from "./heartbeat"

export namespace internal {
  export const Cron = internalCron.Cron
  export function cron(identifier: string): void
  export function cron<T>(identifier: string, fn: () => T): T
  export function cron<T>(identifier: string, fn?: () => T): T | undefined {
    const cron = new Cron(identifier)
    let output

    if (fn) {
      cron.start()
      output = fn()
    }

    if (output instanceof Promise) {
      output.then(() => cron.finish()).catch(() => {})
    } else {
      cron.finish()
    }

    return output
  }

  export function heartbeat(
    identifier: string,
    options?: { continuous: boolean }
  ): void {
    if (options?.continuous) {
      addContinuousHeartbeat(
        setInterval(heartbeat, heartbeatInterval(), identifier).unref()
      )
    }

    scheduler.schedule(Event.heartbeat(identifier))
  }
}

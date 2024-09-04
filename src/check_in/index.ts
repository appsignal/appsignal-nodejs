import { Cron } from "./cron"
export { Cron }
export type { EventKind, Event } from "./cron"

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

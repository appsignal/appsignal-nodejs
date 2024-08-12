import crypto from "crypto"
import { Transmitter } from "./transmitter"
import { Client } from "./client"

export type EventKind = "start" | "finish"

export type Event = {
  identifier: string
  digest: string
  kind: EventKind
  timestamp: number
  check_in_type: "cron"
}

class PendingPromiseSet<T> extends Set<Promise<T>> {
  add(promise: Promise<T>) {
    super.add(promise)
    promise.finally(() => this.delete(promise))
    return this
  }

  async allSettled() {
    await Promise.allSettled(this)
  }
}

export class Cron {
  private static cronPromises = new PendingPromiseSet<any>()

  identifier: string
  digest: string

  constructor(identifier: string) {
    this.identifier = identifier
    this.digest = crypto.randomBytes(8).toString("hex")
  }

  public static async shutdown() {
    await Cron.cronPromises.allSettled()
  }

  public start(): Promise<void> {
    return this.transmit(this.event("start"))
  }

  public finish(): Promise<void> {
    return this.transmit(this.event("finish"))
  }

  private event(kind: EventKind): Event {
    return {
      identifier: this.identifier,
      digest: this.digest,
      kind: kind,
      timestamp: Math.floor(Date.now() / 1000),
      check_in_type: "cron"
    }
  }

  private transmit(event: Event): Promise<void> {
    if (Client.client === undefined || !Client.client.isActive) {
      Client.internalLogger.debug(
        "AppSignal not active, not transmitting cron check-in event"
      )
      return Promise.resolve()
    }

    const promise = new Transmitter(
      `${Client.config.data.loggingEndpoint}/check_ins/json`,
      JSON.stringify(event)
    ).transmit()

    const handledPromise = promise
      .then(({ status }: { status: number }) => {
        if (status >= 200 && status <= 299) {
          Client.internalLogger.trace(
            `Transmitted cron check-in \`${event.identifier}\` (${event.digest}) ${event.kind} event`
          )
        } else {
          Client.internalLogger.warn(
            `Failed to transmit cron check-in ${event.kind} event: status code was ${status}`
          )
        }
      })
      .catch(({ error }: { error: Error }) => {
        Client.internalLogger.warn(
          `Failed to transmit cron check-in ${event.kind} event: ${error.message}`
        )

        return Promise.resolve()
      })

    Cron.cronPromises.add(handledPromise)

    return handledPromise
  }
}

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

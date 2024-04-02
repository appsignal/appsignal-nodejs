import crypto from "crypto"
import { Transmitter } from "./transmitter"
import { Client } from "./client"

export type EventKind = "start" | "finish"

export type Event = {
  name: string
  id: string
  kind: EventKind
  timestamp: number
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

export class Heartbeat {
  private static heartbeatPromises = new PendingPromiseSet<any>()

  name: string
  id: string

  constructor(name: string) {
    this.name = name
    this.id = crypto.randomBytes(8).toString("hex")
  }

  public static async shutdown() {
    await Heartbeat.heartbeatPromises.allSettled()
  }

  public start(): Promise<void> {
    return this.transmit(this.event("start"))
  }

  public finish(): Promise<void> {
    return this.transmit(this.event("finish"))
  }

  private event(kind: EventKind): Event {
    return {
      name: this.name,
      id: this.id,
      kind: kind,
      timestamp: Date.now()
    }
  }

  private transmit(event: Event): Promise<void> {
    if (Client.client === undefined || !Client.client.isActive) {
      Client.internalLogger.debug(
        "AppSignal not active, not transmitting heartbeat event"
      )
      return Promise.resolve()
    }

    const promise = new Transmitter(
      `${Client.config.data.loggingEndpoint}/heartbeats/json`,
      JSON.stringify(event)
    ).transmit()

    const handledPromise = promise
      .then(({ status }: { status: number }) => {
        if (status >= 200 && status <= 299) {
          Client.internalLogger.trace(
            `Transmitted heartbeat \`${event.name}\` (${event.id}) ${event.kind} event`
          )
        } else {
          Client.internalLogger.warn(
            `Failed to transmit heartbeat event: status code was ${status}`
          )
        }
      })
      .catch(({ error }: { error: Error }) => {
        Client.internalLogger.warn(
          `Failed to transmit heartbeat event: ${error.message}`
        )

        return Promise.resolve()
      })

    Heartbeat.heartbeatPromises.add(handledPromise)

    return handledPromise
  }
}

export function heartbeat(name: string): void
export function heartbeat<T>(name: string, fn: () => T): T
export function heartbeat<T>(name: string, fn?: () => T): T | undefined {
  const heartbeat = new Heartbeat(name)
  let output

  if (fn) {
    heartbeat.start()
    output = fn()
  }

  if (output instanceof Promise) {
    output = output.then(result => {
      heartbeat.finish()
      return result
    }) as typeof output
  } else {
    heartbeat.finish()
  }

  return output
}

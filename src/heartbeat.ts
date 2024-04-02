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

export class Heartbeat {
  name: string
  id: string

  constructor(name: string) {
    this.name = name
    this.id = crypto.randomBytes(8).toString("hex")
  }

  public start() {
    this.transmit(this.event("start"))
  }

  public finish() {
    this.transmit(this.event("finish"))
  }

  private event(kind: EventKind): Event {
    return {
      name: this.name,
      id: this.id,
      kind: kind,
      timestamp: Date.now()
    }
  }

  private transmit(event: Event) {
    if (Client.client === undefined || !Client.client.isActive) {
      Client.internalLogger.debug(
        "AppSignal not started; not sending heartbeat"
      )
      return
    }

    new Transmitter(
      `${Client.config.data.loggingEndpoint}/heartbeats/json`,
      JSON.stringify(event)
    ).transmit().then(({status}: {status: number}) => {
      if (status !== 200) {
        Client.internalLogger.warn(`Failed to transmit heartbeat: status code ${status}`)
      }
    }).catch(({error}: {error: Error}) => {
      Client.internalLogger.warn(`Failed to transmit heartbeat: ${error.message}`)
    })
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

  heartbeat.finish()
  return output
}

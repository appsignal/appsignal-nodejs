import { scheduler } from "./scheduler"
import crypto from "crypto"

export type EventKind = "start" | "finish"

export type Event = {
  identifier: string
  digest: string
  kind: EventKind
  timestamp: number
  check_in_type: "cron"
}

export class Cron {
  identifier: string
  digest: string

  constructor(identifier: string) {
    this.identifier = identifier
    this.digest = crypto.randomBytes(8).toString("hex")
  }

  public start(): void {
    scheduler.schedule(this.event("start"))
  }

  public finish(): void {
    scheduler.schedule(this.event("finish"))
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
}

import { scheduler } from "./scheduler"
import crypto from "crypto"
import { Event } from "./event"

export namespace internal {
  export class Cron {
    identifier: string
    digest: string

    constructor(identifier: string) {
      this.identifier = identifier
      this.digest = crypto.randomBytes(8).toString("hex")
    }

    public start(): void {
      scheduler.schedule(Event.cron(this, "start"))
    }

    public finish(): void {
      scheduler.schedule(Event.cron(this, "finish"))
    }
  }
}

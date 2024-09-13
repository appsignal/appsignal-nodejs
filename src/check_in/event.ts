import type { Cron } from "./cron"

export type EventKind = "start" | "finish"
export type EventCheckInType = "cron" | "heartbeat"

export class Event {
  identifier: string
  digest?: string
  kind?: EventKind
  timestamp: number
  check_in_type: EventCheckInType

  constructor({
    identifier,
    digest,
    kind,
    check_in_type
  }: {
    identifier: string
    digest?: string
    kind?: EventKind
    check_in_type: EventCheckInType
  }) {
    this.identifier = identifier
    this.digest = digest
    this.kind = kind
    this.timestamp = Math.floor(Date.now() / 1000)
    this.check_in_type = check_in_type
  }

  static cron(cron: Cron, kind: EventKind) {
    return new Event({
      identifier: cron.identifier,
      digest: cron.digest,
      kind,
      check_in_type: "cron"
    })
  }

  static heartbeat(identifier: string) {
    return new Event({
      identifier,
      check_in_type: "heartbeat"
    })
  }

  isRedundant(newEvent: Event): boolean {
    if (this.check_in_type === "cron") {
      // Consider any existing cron check-in event redundant if it has the
      // same identifier, digest and kind as the one we're adding.
      if (
        newEvent.check_in_type === "cron" &&
        this.identifier === newEvent.identifier &&
        this.kind === newEvent.kind &&
        this.digest === newEvent.digest
      ) {
        return true
      }
    } else if (this.check_in_type === "heartbeat") {
      // Consider any existing heartbeat check-in event redundant if it has
      // the same identifier as the one we're adding.
      if (
        newEvent.check_in_type === "heartbeat" &&
        this.identifier === newEvent.identifier
      ) {
        return true
      }
    }

    return false
  }

  static describe(events: Event[]): string {
    const count = events.length
    if (count === 0) {
      // This shouldn't happen.
      return "no check-in events"
    } else if (count === 1) {
      const event = events[0]
      if (event.check_in_type === "cron") {
        return (
          "cron check-in `" +
          (event.identifier || "unknown") +
          "` " +
          (event.kind || "unknown") +
          " event (digest " +
          (event.digest || "unknown") +
          ")"
        )
      } else if (event.check_in_type === "heartbeat") {
        return (
          "heartbeat check-in `" + (event.identifier || "unknown") + "` event"
        )
      } else {
        return "unknown check-in event"
      }
    } else {
      return `${count} check-in events`
    }
  }
}

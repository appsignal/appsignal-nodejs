import type { Cron } from "./cron"

/** @internal */
export type EventKind = "start" | "finish"
/** @internal */
export type EventCheckInType = "cron" | "heartbeat"

/** @internal */
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

  static deduplicateCron(events: Event[]) {
    // Remove redundant cron check-in events from the given list of events.
    // This is done by removing redundant *pairs* of events -- that is,
    // for each identifier, only send one complete pair of start and
    // finish events. Remove all other complete pairs of start and finish
    // events for that identifier, but keep any other start or finish events
    // that don't have a matching pair.
    //
    // Note that this method assumes that the events in this list have already
    // been rejected based on `Event.isRedundant`, so we don't check to remove
    // check-in events that are functionally identical.

    const start_digests = new Map<string, Set<string | undefined>>()
    const finish_digests = new Map<string, Set<string | undefined>>()
    const complete_digests = new Map<string, Set<string | undefined>>()
    const keep_digest = new Map<string, string | undefined>()

    events.forEach(event => {
      if (event.check_in_type != "cron") {
        return
      }

      let other_set = undefined

      if (!start_digests.has(event.identifier)) {
        start_digests.set(event.identifier, new Set())
        finish_digests.set(event.identifier, new Set())
        complete_digests.set(event.identifier, new Set())
      }

      if (event.kind == "start") {
        start_digests.get(event.identifier)?.add(event.digest)
        other_set = finish_digests
      }

      if (event.kind == "finish") {
        finish_digests.get(event.identifier)?.add(event.digest)
        other_set = start_digests
      }

      if (other_set?.get(event.identifier)?.has(event.digest)) {
        complete_digests.get(event.identifier)?.add(event.digest)
        keep_digest.set(event.identifier, event.digest)
      }
    })

    for (let i = 0; i < events.length; i++) {
      const event = events[i]

      if (
        event.check_in_type != "cron" ||
        (event.kind != "start" && event.kind != "finish")
      ) {
        continue
      }

      if (
        complete_digests?.get(event.identifier)?.has(event.digest) &&
        keep_digest?.get(event.identifier) != event.digest
      ) {
        events.splice(i, 1)
        i--
      }
    }
  }
}

import type { Event } from "./cron"
import { Transmitter } from "../transmitter"
import { Client } from "../client"
import { ndjsonStringify } from "../utils"

const INITIAL_DEBOUNCE_MILLISECONDS = 100
const BETWEEN_TRANSMISSIONS_DEBOUNCE_MILLISECONDS = 10_000

const originalDebounceTime = (lastTransmission: number | undefined): number => {
  if (lastTransmission === undefined) {
    return INITIAL_DEBOUNCE_MILLISECONDS
  }

  const elapsed = Date.now() - lastTransmission

  return Math.max(
    INITIAL_DEBOUNCE_MILLISECONDS,
    BETWEEN_TRANSMISSIONS_DEBOUNCE_MILLISECONDS - elapsed
  )
}

export let debounceTime: typeof originalDebounceTime = originalDebounceTime

export function setDebounceTime(fn: typeof originalDebounceTime) {
  debounceTime = fn
}

export function resetDebounceTime() {
  debounceTime = originalDebounceTime
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

export class Scheduler {
  pendingTransmissions: PendingPromiseSet<any> = new PendingPromiseSet()
  events: Event[] = []
  waker?: NodeJS.Timeout
  lastTransmission?: number
  isShuttingDown = false

  async shutdown() {
    this.isShuttingDown = true
    this.runWaker()
    await this.allSettled()
  }

  allSettled(): Promise<void> {
    return this.pendingTransmissions.allSettled()
  }

  schedule(event: Event) {
    if (Client.client === undefined || !Client.client.isActive) {
      Client.internalLogger.debug(
        `Cannot schedule ${this.describe([event])}: AppSignal is not active`
      )
      return
    }

    if (this.isShuttingDown) {
      Client.internalLogger.debug(
        `Cannot schedule ${this.describe([event])}: AppSignal is stopped`
      )
      return
    }

    Client.internalLogger.trace(`Scheduling ${this.describe([event])}`)

    this.addEvent(event)
    this.scheduleWaker()
  }

  private addEvent(event: Event) {
    // Remove redundant events, keeping the newly added one, which
    // should be the one with the most recent timestamp.
    this.events = this.events.filter(existingEvent => {
      return !this.isRedundantEvent(existingEvent, event)
    })
    this.events.push(event)
  }

  private isRedundantEvent(existingEvent: Event, newEvent: Event): boolean {
    let isRedundant = false

    if (newEvent.check_in_type === "cron") {
      // Consider any existing cron check-in event redundant if it has the
      // same identifier, digest and kind as the one we're adding.
      isRedundant =
        existingEvent.identifier === newEvent.identifier &&
        existingEvent.kind === newEvent.kind &&
        existingEvent.digest === newEvent.digest &&
        existingEvent.check_in_type === "cron"
    }

    if (isRedundant) {
      Client.internalLogger.debug(
        `Replacing previously scheduled ${this.describe([existingEvent])}`
      )
    }

    return isRedundant
  }

  private scheduleWaker() {
    if (this.waker === undefined) {
      this.waker = setTimeout(
        () => this.runWaker(),
        debounceTime(this.lastTransmission)
      )
      // Ensure the debounce period is not awaited when the Node.js process is
      // shutting down -- users must call Appsignal.stop() to gracefully await the
      // transmission of scheduled events.
      this.waker.unref()
    }
  }

  private runWaker() {
    this.lastTransmission = Date.now()
    if (this.waker !== undefined) {
      clearTimeout(this.waker)
      this.waker = undefined
    }

    const events = this.events
    this.events = []
    if (events.length !== 0) {
      // The events array may be empty when this function is called on shutdown.
      this.transmit(events)
    }
  }

  private transmit(events: Event[]) {
    const description = this.describe(events)

    const promise = new Transmitter(
      `${Client.config.data.loggingEndpoint}/check_ins/json`,
      ndjsonStringify(events)
    ).transmit()

    const handledPromise = promise
      .then(({ status }: { status: number }) => {
        if (status >= 200 && status <= 299) {
          Client.internalLogger.trace(`Transmitted ${description}`)
        } else {
          Client.internalLogger.error(
            `Failed to transmit ${description}: status code was ${status}`
          )
        }
      })
      .catch(({ error }: { error: Error }) => {
        Client.internalLogger.error(
          `Failed to transmit ${description}: ${error.message}`
        )

        return Promise.resolve()
      })

    this.pendingTransmissions.add(handledPromise)
  }

  private describe(events: Event[]): string {
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
      } else {
        return "unknown check-in event"
      }
    } else {
      return `${count} check-in events`
    }
  }
}

export let scheduler = new Scheduler()

export async function resetScheduler() {
  await scheduler.shutdown()
  scheduler = new Scheduler()
}

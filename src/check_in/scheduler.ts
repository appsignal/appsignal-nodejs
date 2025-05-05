import { Event } from "./event"
import { Transmitter } from "../transmitter"
import { Client } from "../client"
import { ndjsonStringify, stubbable } from "../utils"

const INITIAL_DEBOUNCE_MILLISECONDS = 100
const BETWEEN_TRANSMISSIONS_DEBOUNCE_MILLISECONDS = 10_000

/** @internal */
export const debounceTime = stubbable(
  (lastTransmission: number | undefined): number => {
    if (lastTransmission === undefined) {
      return INITIAL_DEBOUNCE_MILLISECONDS
    }

    const elapsed = Date.now() - lastTransmission

    return Math.max(
      INITIAL_DEBOUNCE_MILLISECONDS,
      BETWEEN_TRANSMISSIONS_DEBOUNCE_MILLISECONDS - elapsed
    )
  }
)

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

/** @internal */
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
        `Cannot schedule ${Event.describe([event])}: AppSignal is not active`
      )
      return
    }

    if (this.isShuttingDown) {
      Client.internalLogger.debug(
        `Cannot schedule ${Event.describe([event])}: AppSignal is stopped`
      )
      return
    }

    Client.internalLogger.trace(`Scheduling ${Event.describe([event])}`)

    this.addEvent(event)
    this.scheduleWaker()
  }

  private addEvent(event: Event) {
    // Remove redundant events, keeping the newly added one, which
    // should be the one with the most recent timestamp.
    this.events = this.events.filter(existingEvent => {
      const isRedundant = existingEvent.isRedundant(event)

      if (isRedundant) {
        Client.internalLogger.debug(
          `Replacing previously scheduled ${Event.describe([existingEvent])}`
        )
      }

      return !isRedundant
    })
    this.events.push(event)
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
    Event.deduplicateCron(events)
    this.events = []
    if (events.length !== 0) {
      // The events array may be empty when this function is called on shutdown.
      this.transmit(events)
    }
  }

  private transmit(events: Event[]) {
    const description = Event.describe(events)

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
}

/** @internal */
export let scheduler = new Scheduler()

/** @internal */
export async function resetScheduler() {
  await scheduler.shutdown()
  scheduler = new Scheduler()
}

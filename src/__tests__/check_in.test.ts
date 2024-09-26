import nock from "nock"
import { cron, Cron, heartbeat } from "../check_in"
import { Event, EventKind } from "../check_in/event"
import { scheduler, resetScheduler, debounceTime } from "../check_in/scheduler"
import { Client, Options } from "../client"
import {
  heartbeat as deprecatedHeartbeat,
  Heartbeat,
  heartbeatClassWarnOnce,
  heartbeatHelperWarnOnce
} from "../heartbeat"
import { ndjsonParse } from "../utils"
import type { InternalLogger } from "../internal_logger"
import {
  heartbeatInterval,
  killContinuousHeartbeats
} from "../check_in/heartbeat"

const DEFAULT_CLIENT_CONFIG: Partial<Options> = {
  active: true,
  name: "Test App",
  pushApiKey: "test-push-api-key",
  environment: "test",
  hostname: "test-hostname"
}

type Request = Event[]

function mockCheckInRequests(): Request[] {
  const requests: Request[] = []

  const appendCheckInRequests = async () => {
    requests.push(await mockOneCheckInRequest())
    appendCheckInRequests()
  }

  appendCheckInRequests()

  return requests
}

function mockOneCheckInRequest(
  customReply?: (interceptor: nock.Interceptor) => nock.Scope
): Promise<Request> {
  const reply = customReply || (scope => scope.reply(200, ""))

  return new Promise(resolve => {
    const interceptor = nock("https://appsignal-endpoint.net:443")
      .post("/check_ins/json")
      .query({
        api_key: "test-push-api-key",
        name: "Test App",
        environment: "test",
        hostname: "test-hostname"
      })
    const scope = reply(interceptor)
    scope.on("request", (_req, _interceptor, body: string) => {
      resolve(ndjsonParse(body) as Event[])
    })
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function expectEvents(actual: Event[], expected: Partial<Event>[]): void {
  expect(actual).toHaveLength(expected.length)

  for (let i = 0; i < expected.length; i++) {
    const event = actual[i]
    const expectedEvent = expected[i]

    for (const key in expectedEvent) {
      expect(event[key as keyof Event]).toEqual(
        expectedEvent[key as keyof Event]
      )
    }
  }
}

function expectCronEvents(actual: Event[], expected: EventKind[]): void {
  expectEvents(
    actual,
    expected.map(kind => ({
      identifier: "test-cron-checkin",
      kind,
      check_in_type: "cron"
    }))
  )
}

function spyOnInternalLogger(
  client: Client
): Record<keyof InternalLogger, jest.SpyInstance> {
  const spies: Partial<Record<keyof InternalLogger, jest.SpyInstance>> = {}

  for (const level of ["error", "warn", "info", "debug", "trace"] as const) {
    spies[level] = jest
      .spyOn(client.internalLogger, level as keyof InternalLogger)
      .mockImplementation()
  }

  return spies as Required<typeof spies>
}

describe("Check-ins", () => {
  let client: Client
  let theCron: Cron
  let requests: Request[]

  beforeAll(() => {
    theCron = new Cron("test-cron-checkin")

    if (!nock.isActive()) {
      nock.activate()
    }
  })

  beforeEach(async () => {
    await resetScheduler()
    debounceTime.reset()

    client = new Client(DEFAULT_CLIENT_CONFIG)

    nock.disableNetConnect()
    requests = mockCheckInRequests()
  })

  afterEach(async () => {
    await client.stop()
    nock.cleanAll()
  })

  afterAll(async () => {
    await resetScheduler()
    debounceTime.reset()
    nock.restore()
  })

  it("does not transmit any events when AppSignal is not active", async () => {
    client.stop()
    client = new Client({
      ...DEFAULT_CLIENT_CONFIG,
      active: false
    })

    const internalLoggerSpies = spyOnInternalLogger(client)

    theCron.start()
    theCron.finish()

    expect(internalLoggerSpies.debug).toHaveBeenCalledTimes(2)
    internalLoggerSpies.debug.mock.calls.forEach(call => {
      expect(call[0]).toMatch(/^Cannot schedule cron check-in/)
      expect(call[0]).toMatch(/: AppSignal is not active$/)
    })

    await scheduler.shutdown()

    expect(requests).toHaveLength(0)
  })

  it("does not transmit any events when AppSignal is shutting down", async () => {
    await scheduler.shutdown()

    const internalLoggerSpies = spyOnInternalLogger(client)

    theCron.start()
    theCron.finish()

    expect(internalLoggerSpies.debug).toHaveBeenCalledTimes(2)
    internalLoggerSpies.debug.mock.calls.forEach(call => {
      expect(call[0]).toMatch(/^Cannot schedule cron check-in/)
      expect(call[0]).toMatch(/: AppSignal is stopped$/)
    })

    expect(requests).toHaveLength(0)
  })

  it("cron.start() sends a cron check-in start event", async () => {
    const internalLoggerSpies = spyOnInternalLogger(client)

    theCron.start()

    expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(1)
    expect(internalLoggerSpies.trace.mock.calls[0][0]).toMatch(
      /^Scheduling cron check-in `test-cron-checkin` start event/
    )

    await scheduler.shutdown()

    expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(2)
    expect(internalLoggerSpies.trace.mock.calls[1][0]).toMatch(
      /^Transmitted cron check-in `test-cron-checkin` start event/
    )

    expect(requests).toHaveLength(1)
    expectCronEvents(requests[0], ["start"])
  })

  it("cron.finish() sends a cron check-in finish event", async () => {
    const internalLoggerSpies = spyOnInternalLogger(client)

    theCron.finish()

    expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(1)
    expect(internalLoggerSpies.trace.mock.calls[0][0]).toMatch(
      /^Scheduling cron check-in `test-cron-checkin` finish event/
    )

    await scheduler.shutdown()

    expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(2)
    expect(internalLoggerSpies.trace.mock.calls[1][0]).toMatch(
      /^Transmitted cron check-in `test-cron-checkin` finish event/
    )

    expect(requests).toHaveLength(1)
    expectCronEvents(requests[0], ["finish"])
  })

  describe("Scheduler", () => {
    beforeEach(() => {
      // Remove the persistent mock for all requests.
      // These tests will mock requests one by one, so that
      // they can await their responses.
      nock.cleanAll()
      debounceTime.set(() => 20)
    })

    it("transmits events close to each other in time in a single request", async () => {
      const request = mockOneCheckInRequest()

      theCron.start()
      theCron.finish()

      const internalLoggerSpies = spyOnInternalLogger(client)

      const events = await request
      expectCronEvents(events, ["start", "finish"])

      await scheduler.allSettled()

      expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(1)
      expect(internalLoggerSpies.trace).toHaveBeenLastCalledWith(
        "Transmitted 2 check-in events"
      )
    })

    it("transmits events far apart in time in separate requests", async () => {
      let request = mockOneCheckInRequest()

      theCron.start()

      let events = await request
      expectCronEvents(events, ["start"])

      request = mockOneCheckInRequest()

      theCron.finish()

      events = await request
      expectCronEvents(events, ["finish"])
    })

    it("does not transmit redundant events in the same request", async () => {
      const request = mockOneCheckInRequest()

      theCron.start()

      const internalLoggerSpies = spyOnInternalLogger(client)

      theCron.start()

      expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(1)
      expect(internalLoggerSpies.trace.mock.calls[0][0]).toMatch(
        /^Scheduling cron check-in `test-cron-checkin` start event/
      )

      expect(internalLoggerSpies.debug).toHaveBeenCalledTimes(1)
      expect(internalLoggerSpies.debug.mock.calls[0][0]).toMatch(
        /^Replacing previously scheduled cron check-in `test-cron-checkin` start event/
      )

      const events = await request
      expectCronEvents(events, ["start"])
      await scheduler.allSettled()

      expect(internalLoggerSpies.trace).toHaveBeenCalledTimes(2)
      expect(internalLoggerSpies.trace.mock.calls[1][0]).toMatch(
        /^Transmitted cron check-in `test-cron-checkin` start event/
      )
    })

    it("logs an error when the request returns a non-2xx status code", async () => {
      const request = mockOneCheckInRequest(interceptor =>
        interceptor.reply(500, "")
      )

      theCron.start()

      const internalLoggerSpies = spyOnInternalLogger(client)

      await request
      await scheduler.allSettled()

      expect(internalLoggerSpies.error).toHaveBeenCalledTimes(1)
      expect(internalLoggerSpies.error.mock.calls[0][0]).toMatch(
        /^Failed to transmit cron check-in `test-cron-checkin` start event/
      )
      expect(internalLoggerSpies.error.mock.calls[0][0]).toMatch(
        /: status code was 500$/
      )
    })

    it("logs an error when the request fails", async () => {
      const request = mockOneCheckInRequest(interceptor =>
        interceptor.replyWithError("something went wrong")
      )

      theCron.start()

      const internalLoggerSpies = spyOnInternalLogger(client)

      await request
      await scheduler.allSettled()

      expect(internalLoggerSpies.error).toHaveBeenCalledTimes(1)
      expect(internalLoggerSpies.error.mock.calls[0][0]).toMatch(
        /^Failed to transmit cron check-in `test-cron-checkin` start event/
      )
      expect(internalLoggerSpies.error.mock.calls[0][0]).toMatch(
        /: something went wrong$/
      )
    })

    it("transmits scheduled events when the scheduler is shut down", async () => {
      // Set a very long debounce time to ensure that the scheduler
      // is not awaiting it, but rather sending the events immediately
      // on shutdown.
      debounceTime.set(() => 10000)

      theCron.start()

      const request = mockOneCheckInRequest()

      await scheduler.shutdown()

      const events = await request
      expectCronEvents(events, ["start"])
    })

    it("uses the last transmission time to calculate the debounce", async () => {
      const request = mockOneCheckInRequest()

      const debounceTimeMock = jest.fn(_lastTransmission => 0)
      debounceTime.set(debounceTimeMock)

      theCron.start()

      expect(debounceTimeMock).toHaveBeenCalledTimes(1)
      expect(debounceTimeMock).toHaveBeenLastCalledWith(undefined)

      await request
      const expectedLastTransmission = Date.now()

      theCron.finish()

      expect(debounceTimeMock).toHaveBeenCalledTimes(2)
      expect(debounceTimeMock).not.toHaveBeenLastCalledWith(undefined)
      // Allow for some margin of error in the timing of the tests.
      expect(debounceTimeMock.mock.calls[1][0]).toBeGreaterThan(
        expectedLastTransmission - 20
      )
    })

    describe("debounce time", () => {
      beforeEach(debounceTime.reset)

      it("is short when no last transmission time is given", () => {
        expect(debounceTime(undefined)).toBe(100)
      })

      it("is short when the last transmission time was a long time ago", () => {
        expect(debounceTime(0)).toBe(100)
      })

      it("is long when the last transmission time is very recent", () => {
        // Allow for some margin of error in the timing of the tests.
        expect(debounceTime(Date.now())).toBeLessThanOrEqual(10000)
        expect(debounceTime(Date.now())).toBeGreaterThan(10000 - 20)
      })
    })
  })

  describe("Appsignal.checkIn.cron()", () => {
    it("without a function, sends a cron check-in finish event", async () => {
      expect(cron("test-cron-checkin")).toBeUndefined()

      await scheduler.shutdown()

      expect(requests).toHaveLength(1)
      expectCronEvents(requests[0], ["finish"])
    })

    describe("with a function", () => {
      it("sends cron check-in start and finish events", async () => {
        expect(
          cron("test-cron-checkin", () => {
            const thisSecond = Math.floor(Date.now() / 1000)

            // Since this function must be synchronous, we need to deadlock
            // until the next second in order to obtain different timestamps
            // for the start and finish events.
            // eslint-disable-next-line no-constant-condition
            while (true) {
              if (Math.floor(Date.now() / 1000) != thisSecond) break
            }

            return "output"
          })
        ).toBe("output")

        await scheduler.shutdown()

        expect(requests).toHaveLength(1)
        expectCronEvents(requests[0], ["start", "finish"])
        expect(requests[0][0].timestamp).toBeLessThan(requests[0][1].timestamp)
      })

      it("does not send a finish event when the function throws an error", async () => {
        expect(() => {
          cron("test-cron-checkin", () => {
            throw new Error("thrown")
          })
        }).toThrow("thrown")

        await scheduler.shutdown()

        expect(requests).toHaveLength(1)
        expectCronEvents(requests[0], ["start"])
      })
    })

    describe("with an async function", () => {
      it("sends cron check-in start and finish events", async () => {
        // Set a debounce time larger than the maximum sleep time.
        // This is to ensure that the scheduler will not send the start and
        // finish events together at shutdown, rather than in separate
        // requests.
        debounceTime.set(() => {
          return 10000
        })

        await expect(
          cron("test-cron-checkin", async () => {
            const millisecondsToNextSecond = 1000 - (Date.now() % 1000)
            await sleep(millisecondsToNextSecond)

            return "output"
          })
        ).resolves.toBe("output")

        await scheduler.shutdown()

        expect(requests).toHaveLength(1)
        expectCronEvents(requests[0], ["start", "finish"])
        expect(requests[0][0].timestamp).toBeLessThan(requests[0][1].timestamp)
      })

      it("does not send a finish event when the promise returned is rejected", async () => {
        // Set a debounce time larger than the maximum sleep time.
        // This is to ensure that the scheduler will not send the start and
        // finish events together at shutdown, rather than in separate
        // requests.
        debounceTime.set(() => 10000)

        await expect(
          cron("test-cron-checkin", async () => {
            throw new Error("rejected")
          })
        ).rejects.toThrow("rejected")

        await scheduler.shutdown()

        expect(requests).toHaveLength(1)
        expectCronEvents(requests[0], ["start"])
      })
    })
  })

  describe("Appsignal.checkIn.heartbeat()", () => {
    beforeAll(() => {
      heartbeatInterval.set(() => 20)
    })

    afterEach(() => {
      killContinuousHeartbeats()
    })

    afterAll(() => {
      heartbeatInterval.reset()
    })

    it("sends a heartbeat event", async () => {
      heartbeat("test-heartbeat")

      await scheduler.shutdown()

      expect(requests).toHaveLength(1)
      expectEvents(requests[0], [
        {
          identifier: "test-heartbeat",
          check_in_type: "heartbeat"
        }
      ])
    })

    describe("with the `continuous: true` option", () => {
      it("sends heartbeat events continuously", async () => {
        debounceTime.set(() => 20)

        heartbeat("test-heartbeat", { continuous: true })

        await sleep(60)
        await scheduler.shutdown()

        expect(requests.length).toBeGreaterThanOrEqual(2)

        for (const request of requests) {
          expectEvents(request, [
            {
              identifier: "test-heartbeat",
              check_in_type: "heartbeat"
            }
          ])
        }
      })
    })
  })

  describe("Appsignal.heartbeat (deprecated)", () => {
    beforeEach(() => {
      heartbeatHelperWarnOnce.reset()
    })

    it("behaves like Appsignal.checkIn.cron", async () => {
      expect(deprecatedHeartbeat("test-cron-checkin")).toBeUndefined()

      await scheduler.shutdown()

      expect(requests).toHaveLength(1)
      expectCronEvents(requests[0], ["finish"])
    })

    it("emits a warning when called", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()
      const internalLoggerWarnSpy = jest
        .spyOn(Client.internalLogger, "warn")
        .mockImplementation()

      expect(deprecatedHeartbeat("test-cron-checkin")).toBeUndefined()

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(1)
        expect(spy.mock.calls[0][0]).toMatch(
          /The helper `heartbeat` has been deprecated./
        )
      }
    })

    it("only emits a warning on the first call", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()
      const internalLoggerWarnSpy = jest
        .spyOn(Client.internalLogger, "warn")
        .mockImplementation()

      expect(deprecatedHeartbeat("test-cron-checkin")).toBeUndefined()

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(1)
        expect(spy.mock.calls[0][0]).toMatch(
          /The helper `heartbeat` has been deprecated./
        )
        spy.mockClear()
      }

      expect(deprecatedHeartbeat("test-cron-checkin")).toBeUndefined()

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(0)
      }
    })
  })

  describe("Appsignal.Heartbeat (deprecated)", () => {
    beforeEach(() => {
      heartbeatClassWarnOnce.reset()
    })

    it("returns an Appsignal.checkIn.Cron instance on initialisation", async () => {
      expect(new Heartbeat("test-cron-checkin")).toBeInstanceOf(Cron)
    })

    it("emits a warning when called", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()
      const internalLoggerWarnSpy = jest
        .spyOn(Client.internalLogger, "warn")
        .mockImplementation()

      expect(new Heartbeat("test-cron-checkin")).toBeInstanceOf(Cron)

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(1)
        expect(spy.mock.calls[0][0]).toMatch(
          /The class `Heartbeat` has been deprecated./
        )
      }
    })

    it("only emits a warning on the first call", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()
      const internalLoggerWarnSpy = jest
        .spyOn(Client.internalLogger, "warn")
        .mockImplementation()

      expect(new Heartbeat("test-cron-checkin")).toBeInstanceOf(Cron)

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(1)
        expect(spy.mock.calls[0][0]).toMatch(
          /The class `Heartbeat` has been deprecated./
        )
        spy.mockClear()
      }

      expect(new Heartbeat("test-cron-checkin")).toBeInstanceOf(Cron)

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(0)
      }
    })
  })
})

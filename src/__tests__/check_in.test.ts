import nock, { Scope } from "nock"
import { cron, Cron, EventKind } from "../check_in"
import { Client, Options } from "../client"
import {
  heartbeat,
  Heartbeat,
  heartbeatClassWarnOnce,
  heartbeatHelperWarnOnce
} from "../heartbeat"

const DEFAULT_CLIENT_CONFIG: Partial<Options> = {
  active: true,
  name: "Test App",
  pushApiKey: "test-push-api-key",
  environment: "test",
  hostname: "test-hostname"
}

function mockCronCheckInRequest(
  kind: EventKind,
  { delay } = { delay: 0 }
): Scope {
  return nock("https://appsignal-endpoint.net:443")
    .post("/check_ins/json", body => {
      return (
        body.identifier === "test-cron-checkin" &&
        body.kind === kind &&
        body.check_in_type === "cron"
      )
    })
    .query({
      api_key: "test-push-api-key",
      name: "Test App",
      environment: "test",
      hostname: "test-hostname"
    })
    .delay(delay)
    .reply(200, "")
}

function nextTick(fn: () => void): Promise<void> {
  return new Promise(resolve => {
    process.nextTick(() => {
      fn()
      resolve()
    })
  })
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

function interceptRequestBody(scope: Scope): Promise<string> {
  return new Promise(resolve => {
    scope.on("request", (_req, _interceptor, body: string) => {
      resolve(body)
    })
  })
}

describe("checkIn.Cron", () => {
  let client: Client
  let theCron: Cron

  beforeAll(() => {
    theCron = new Cron("test-cron-checkin")

    if (!nock.isActive()) {
      nock.activate()
    }
  })

  beforeEach(() => {
    client = new Client(DEFAULT_CLIENT_CONFIG)

    nock.cleanAll()
    nock.disableNetConnect()
  })

  afterEach(() => {
    client.stop()
  })

  afterAll(() => {
    nock.restore()
  })

  it("does not transmit any events when AppSignal is not active", async () => {
    client.stop()
    client = new Client({
      ...DEFAULT_CLIENT_CONFIG,
      active: false
    })

    const startScope = mockCronCheckInRequest("start")
    const finishScope = mockCronCheckInRequest("finish")

    await expect(theCron.start()).resolves.toBeUndefined()
    await expect(theCron.finish()).resolves.toBeUndefined()

    expect(startScope.isDone()).toBe(false)
    expect(finishScope.isDone()).toBe(false)
  })

  it("cron.start() sends a cron check-in start event", async () => {
    const scope = mockCronCheckInRequest("start")

    await expect(theCron.start()).resolves.toBeUndefined()

    scope.done()
  })

  it("cron.finish() sends a cron check-in finish event", async () => {
    const scope = mockCronCheckInRequest("finish")

    await expect(theCron.finish()).resolves.toBeUndefined()

    scope.done()
  })

  it("Cron.shutdown() awaits pending cron check-in event promises", async () => {
    const startScope = mockCronCheckInRequest("start", { delay: 100 })
    const finishScope = mockCronCheckInRequest("finish", { delay: 200 })

    let finishPromiseResolved = false
    let shutdownPromiseResolved = false

    const startPromise = theCron.start()

    theCron.finish().then(() => {
      finishPromiseResolved = true
    })

    const shutdownPromise = Cron.shutdown().then(() => {
      shutdownPromiseResolved = true
    })

    await expect(startPromise).resolves.toBeUndefined()

    // The finish promise should still be pending, so the shutdown promise
    // should not be resolved yet.
    await nextTick(() => {
      expect(finishPromiseResolved).toBe(false)
      expect(shutdownPromiseResolved).toBe(false)
    })

    startScope.done()

    // The shutdown promise should not resolve until the finish promise
    // resolves.
    await expect(shutdownPromise).resolves.toBeUndefined()

    await nextTick(() => {
      expect(finishPromiseResolved).toBe(true)
    })

    finishScope.done()
  })

  describe("Appsignal.checkIn.cron()", () => {
    it("without a function, sends a cron check-in finish event", async () => {
      const startScope = mockCronCheckInRequest("start")
      const finishScope = mockCronCheckInRequest("finish")

      expect(cron("test-cron-checkin")).toBeUndefined()

      await nextTick(() => {
        expect(startScope.isDone()).toBe(false)
        finishScope.done()
      })
    })

    describe("with a function", () => {
      it("sends cron check-in start and finish events", async () => {
        const startScope = mockCronCheckInRequest("start")
        const startBody = interceptRequestBody(startScope)

        const finishScope = mockCronCheckInRequest("finish")
        const finishBody = interceptRequestBody(finishScope)

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

        // Since the function is synchronous and deadlocks, the start and
        // finish events' requests are actually initiated simultaneously
        // afterwards, when the function finishes and the event loop ticks.
        await nextTick(() => {
          startScope.done()
          finishScope.done()
        })

        expect(JSON.parse(await finishBody).timestamp).toBeGreaterThan(
          JSON.parse(await startBody).timestamp
        )
      })

      it("does not send a finish event when the function throws an error", async () => {
        const startScope = mockCronCheckInRequest("start")
        const finishScope = mockCronCheckInRequest("finish")

        expect(() => {
          cron("test-cron-checkin", () => {
            throw new Error("thrown")
          })
        }).toThrow("thrown")

        await nextTick(() => {
          startScope.done()
          expect(finishScope.isDone()).toBe(false)
        })
      })
    })

    describe("with an async function", () => {
      it("sends cron check-in start and finish events", async () => {
        const startScope = mockCronCheckInRequest("start")
        const startBody = interceptRequestBody(startScope)

        const finishScope = mockCronCheckInRequest("finish")
        const finishBody = interceptRequestBody(finishScope)

        await expect(
          cron("test-cron-checkin", async () => {
            await nextTick(() => {
              startScope.done()
              expect(finishScope.isDone()).toBe(false)
            })

            const millisecondsToNextSecond = 1000 - (Date.now() % 1000)
            await sleep(millisecondsToNextSecond)

            return "output"
          })
        ).resolves.toBe("output")

        await nextTick(() => {
          startScope.done()
          finishScope.done()
        })

        expect(JSON.parse(await finishBody).timestamp).toBeGreaterThan(
          JSON.parse(await startBody).timestamp
        )
      })

      it("does not send a finish event when the promise returned is rejected", async () => {
        const startScope = mockCronCheckInRequest("start")
        const finishScope = mockCronCheckInRequest("finish")

        await expect(
          cron("test-cron-checkin", async () => {
            await nextTick(() => {
              startScope.done()
              expect(finishScope.isDone()).toBe(false)
            })

            throw new Error("rejected")
          })
        ).rejects.toThrow("rejected")

        await nextTick(() => {
          startScope.done()
          expect(finishScope.isDone()).toBe(false)
        })
      })
    })
  })

  describe("Appsignal.heartbeat (deprecated)", () => {
    beforeEach(() => {
      heartbeatHelperWarnOnce.reset()
    })

    it("behaves like Appsignal.checkIn.cron", async () => {
      const startScope = mockCronCheckInRequest("start")
      const finishScope = mockCronCheckInRequest("finish")

      expect(heartbeat("test-cron-checkin")).toBeUndefined()

      await nextTick(() => {
        expect(startScope.isDone()).toBe(false)
        finishScope.done()
      })
    })

    it("emits a warning when called", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation()
      const internalLoggerWarnSpy = jest
        .spyOn(Client.internalLogger, "warn")
        .mockImplementation()

      expect(heartbeat("test-cron-checkin")).toBeUndefined()

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

      expect(heartbeat("test-cron-checkin")).toBeUndefined()

      for (const spy of [consoleWarnSpy, internalLoggerWarnSpy]) {
        expect(spy.mock.calls).toHaveLength(1)
        expect(spy.mock.calls[0][0]).toMatch(
          /The helper `heartbeat` has been deprecated./
        )
        spy.mockClear()
      }

      expect(heartbeat("test-cron-checkin")).toBeUndefined()

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

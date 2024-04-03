import nock, { Scope } from "nock"
import { heartbeat, Heartbeat, EventKind } from "../heartbeat"
import { Client, Options } from "../client"

const DEFAULT_CLIENT_CONFIG: Partial<Options> = {
  active: true,
  name: "Test App",
  pushApiKey: "test-push-api-key",
  environment: "test",
  hostname: "test-hostname"
}

function mockHeartbeatRequest(
  kind: EventKind,
  { delay } = { delay: 0 }
): Scope {
  return nock("https://appsignal-endpoint.net:443")
    .post("/heartbeats/json", body => {
      return body.name === "test-heartbeat" && body.kind === kind
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

describe("Heartbeat", () => {
  let client: Client
  let theHeartbeat: Heartbeat

  beforeAll(() => {
    theHeartbeat = new Heartbeat("test-heartbeat")

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

    const startScope = mockHeartbeatRequest("start")
    const finishScope = mockHeartbeatRequest("finish")

    await expect(theHeartbeat.start()).resolves.toBeUndefined()
    await expect(theHeartbeat.finish()).resolves.toBeUndefined()

    expect(startScope.isDone()).toBe(false)
    expect(finishScope.isDone()).toBe(false)
  })

  it("heartbeat.start() sends a heartbeat start event", async () => {
    const scope = mockHeartbeatRequest("start")

    await expect(theHeartbeat.start()).resolves.toBeUndefined()

    scope.done()
  })

  it("heartbeat.finish() sends a heartbeat finish event", async () => {
    const scope = mockHeartbeatRequest("finish")

    await expect(theHeartbeat.finish()).resolves.toBeUndefined()

    scope.done()
  })

  it("Heartbeat.shutdown() awaits pending heartbeat event promises", async () => {
    const startScope = mockHeartbeatRequest("start", { delay: 100 })
    const finishScope = mockHeartbeatRequest("finish", { delay: 200 })

    let finishPromiseResolved = false
    let shutdownPromiseResolved = false

    const startPromise = theHeartbeat.start()

    theHeartbeat.finish().then(() => {
      finishPromiseResolved = true
    })

    const shutdownPromise = Heartbeat.shutdown().then(() => {
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

  describe("Appsignal.heartbeat()", () => {
    it("without a function, sends a heartbeat finish event", async () => {
      const startScope = mockHeartbeatRequest("start")
      const finishScope = mockHeartbeatRequest("finish")

      expect(heartbeat("test-heartbeat")).toBeUndefined()

      await nextTick(() => {
        expect(startScope.isDone()).toBe(false)
        finishScope.done()
      })
    })

    describe("with a function", () => {
      it("sends heartbeat start and finish events", async () => {
        const startScope = mockHeartbeatRequest("start")
        const startBody = interceptRequestBody(startScope)

        const finishScope = mockHeartbeatRequest("finish")
        const finishBody = interceptRequestBody(finishScope)

        expect(
          heartbeat("test-heartbeat", () => {
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
        const startScope = mockHeartbeatRequest("start")
        const finishScope = mockHeartbeatRequest("finish")

        expect(() => {
          heartbeat("test-heartbeat", () => {
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
      it("sends heartbeat start and finish events", async () => {
        const startScope = mockHeartbeatRequest("start")
        const startBody = interceptRequestBody(startScope)

        const finishScope = mockHeartbeatRequest("finish")
        const finishBody = interceptRequestBody(finishScope)

        await expect(
          heartbeat("test-heartbeat", async () => {
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
        const startScope = mockHeartbeatRequest("start")
        const finishScope = mockHeartbeatRequest("finish")

        await expect(
          heartbeat("test-heartbeat", async () => {
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
})

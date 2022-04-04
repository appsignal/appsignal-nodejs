import { ScopeManager } from "../scope"
import { RootSpan, ChildSpan } from "../span"
import { Span } from "../interfaces/span"

describe("ScopeManager", () => {
  let scopeManager: ScopeManager

  beforeEach(() => {
    scopeManager = new ScopeManager()
    scopeManager.enable()
  })

  afterEach(() => {
    scopeManager.disable()
  })

  // Returns a promise for the return value of a function, to be
  // ran in a process spawned with `process.nextTick`
  function asyncTask<T>(fn: () => T): Promise<T> {
    return new Promise(resolve => process.nextTick(() => resolve(fn())))
  }

  function asyncTaskWithContext<T>(
    scopeManager: ScopeManager,
    span: Span,
    fn: () => T
  ): Promise<T> {
    let asyncTaskPromise

    scopeManager.withContext(span, () => {
      asyncTaskPromise = asyncTask(fn)
    })

    // `scopeManager.withContext` executes the function given to it
    // immediately, so `asyncTaskPromise` is always assigned -- but
    // the TypeScript compiler doesn't know that, so we ask it to
    // trust us that it's not `undefined`.
    return (asyncTaskPromise as unknown) as Promise<T>
  }

  describe("new ScopeManager()", () => {
    it("has a disabled async hook", async () => {
      scopeManager = new ScopeManager()
      const span = new RootSpan()

      await expect(
        asyncTaskWithContext(scopeManager, span, () => scopeManager.active())
      ).resolves.toBe(undefined)
    })
  })

  describe(".enable()", () => {
    it("enables the async hook", async () => {
      scopeManager = new ScopeManager()
      const span = new RootSpan()

      scopeManager.enable()

      await expect(
        asyncTaskWithContext(scopeManager, span, () => scopeManager.active())
      ).resolves.toBe(span)
    })
  })

  describe(".disable()", () => {
    it("disables the async hook", async () => {
      const span = new RootSpan()

      scopeManager.disable()

      await expect(
        asyncTaskWithContext(scopeManager, span, () => scopeManager.active())
      ).resolves.toBe(undefined)
    })

    it("forgets all active spans", () => {
      const span = new RootSpan()

      scopeManager.withContext(span, () => {
        expect(scopeManager.active()).toBe(span)
        scopeManager.disable()
        expect(scopeManager.active()).toBe(undefined)
      })
    })
  })

  describe(".setRoot()", () => {
    it("sets the root span and active span for the current process", () => {
      const span = new RootSpan()

      scopeManager.setRoot(span)

      expect(scopeManager.root()).toBe(span)
      expect(scopeManager.active()).toBe(span)
    })

    describe("when there is an active span", () => {
      it("does not set the active span for the current process", () => {
        const rootSpan = new RootSpan()
        const childSpan = new ChildSpan(rootSpan)

        scopeManager.withContext(childSpan, () => {
          scopeManager.setRoot(rootSpan)
          expect(scopeManager.active()).toBe(childSpan)
        })
      })
    })
  })

  describe(".withContext()", () => {
    it("runs the callback", () => {
      const fn = jest.fn()
      scopeManager.withContext(new RootSpan(), fn)
      expect(fn).toBeCalled()
    })

    it("runs the callback when disabled", () => {
      const fn = jest.fn()
      scopeManager.disable()
      scopeManager.withContext(new RootSpan(), fn)
      expect(fn).toBeCalled()
    })

    it("rethrows errors", () => {
      const err = new Error("This should be rethrown")

      expect(() =>
        scopeManager.withContext(new RootSpan(), () => {
          throw err
        })
      ).toThrow(err)
    })

    it("sets the given span as the active span", () => {
      const span = new RootSpan()

      scopeManager.withContext(span, () => {
        expect(scopeManager.active()).toBe(span)
      })
    })

    it("restores the previous active span and root span", () => {
      const outerRootSpan = new RootSpan()
      const outerChildSpan = new ChildSpan(outerRootSpan)
      const innerChildSpan = new ChildSpan(outerChildSpan)
      const innerRootSpan = new RootSpan()

      scopeManager.setRoot(outerRootSpan)

      scopeManager.withContext(outerChildSpan, () => {
        scopeManager.withContext(innerChildSpan, () => {
          scopeManager.setRoot(innerRootSpan)
        })

        expect(scopeManager.active()).toBe(outerChildSpan)
        expect(scopeManager.root()).toBe(outerRootSpan)
      })

      expect(scopeManager.active()).toBe(outerRootSpan)
      expect(scopeManager.root()).toBe(outerRootSpan)
    })
  })

  describe(".bindContext()", () => {
    it("Propagates context to bound functions", () => {
      const test = new RootSpan({ namespace: "test" })

      let fn = () => {
        const span = scopeManager.active()

        expect(span).toBeDefined()
        expect(span?.toObject().name).toEqual("modified")
      }

      scopeManager.withContext(test, span => {
        span.setName("default")
        expect(span.toObject().name).toEqual("default")
      })

      scopeManager.withContext(test, span => {
        span.setName("modified")
        fn = scopeManager.bindContext(fn)
      })

      fn()
    })
  })

  // TODO: Add tests
  describe(".emitWithContext()", () => {})
})

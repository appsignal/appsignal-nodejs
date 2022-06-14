import { ScopeManager } from "../scope"
import { RootSpan, ChildSpan } from "../span"
import { Span } from "../interfaces/span"
import { EventEmitter } from "events"
import { NoopSpan } from "../noops/span"

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
    return asyncTaskPromise as unknown as Promise<T>
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

    it("doesn't return active span is span is closed", async () => {
      scopeManager = new ScopeManager()
      const span = new RootSpan()

      scopeManager.enable()

      span.close()
      await expect(
        asyncTaskWithContext(scopeManager, span, () => {
          return scopeManager.active()
        })
      ).resolves.toBeUndefined()
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

    it("when root span is closed, it doesn't overwrite the root span", () => {
      const span1 = new RootSpan()
      scopeManager.setRoot(span1)

      const span2 = new RootSpan()
      span2.close()
      scopeManager.setRoot(span2)

      expect(scopeManager.root()).toBe(span1)
      expect(scopeManager.active()).toBe(span1)
    })
  })

  describe(".root()", () => {
    it("when root span is open, it returns the root span", () => {
      const root = new RootSpan({ namespace: "root" })
      scopeManager.setRoot(root)
      expect(root.open).toBeTruthy()

      const span = scopeManager.root()
      expect(span).toBe(root)
    })

    it("when root span is closed, it returns undefined", () => {
      const root = new RootSpan({ namespace: "root" })
      scopeManager.setRoot(root)
      root.close()
      expect(root.open).toBeFalsy()

      const span = scopeManager.root()
      expect(span).toBeUndefined()
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

    it("stores and rethrows errors", () => {
      const rootSpan = new RootSpan()
      scopeManager.setRoot(rootSpan)
      const span = new ChildSpan(rootSpan)
      const err = new Error("This should be rethrown")

      expect(() =>
        scopeManager.withContext(span, () => {
          throw err
        })
      ).toThrow(err)
      expect(rootSpan.toObject().error).toEqual({
        name: "Error",
        message: "This should be rethrown",
        backtrace: expect.any(String)
      })
    })

    it("sets the given span as the active span", () => {
      const span = new RootSpan()

      scopeManager.withContext(span, () => {
        expect(scopeManager.active()).toBe(span)
      })
    })

    it("when the given span is closed, it doesn't overwrite the current span", () => {
      const span1 = new RootSpan()
      scopeManager.setRoot(span1)

      const span2 = new RootSpan()
      span2.close()
      scopeManager.setRoot(span2)

      scopeManager.withContext(span2, spanInner => {
        expect(scopeManager.root()).toBe(span1)
        expect(scopeManager.active()).toBe(span1)
        expect(spanInner).toBe(span1)
      })
    })

    it("when the given span is closed, and there is no active span, it passes NoopSpan to the given function", () => {
      const span1 = new RootSpan()
      scopeManager.setRoot(span1)
      span1.close()

      scopeManager.withContext(span1, spanInner => {
        expect(scopeManager.root()).toBeUndefined()
        expect(scopeManager.active()).toBeUndefined()
        expect(spanInner).toBeInstanceOf(NoopSpan)
      })
    })

    it("restores the previous active span", () => {
      const outerRootSpan = new RootSpan()
      const outerChildSpan = new ChildSpan(outerRootSpan)
      const innerChildSpan = new ChildSpan(outerChildSpan)

      scopeManager.setRoot(outerRootSpan)
      expect(scopeManager.active()).toBe(outerRootSpan)
      expect(scopeManager.root()).toBe(outerRootSpan)

      scopeManager.withContext(outerChildSpan, () => {
        scopeManager.withContext(innerChildSpan, () => {
          expect(scopeManager.root()).toBe(outerRootSpan)
          expect(scopeManager.active()).toBe(innerChildSpan)
        })

        expect(scopeManager.active()).toBe(outerChildSpan)
        expect(scopeManager.root()).toBe(outerRootSpan)
      })

      expect(scopeManager.active()).toBe(outerRootSpan)
      expect(scopeManager.root()).toBe(outerRootSpan)
    })

    it("does not restore the root span if it was changed within withContext", () => {
      const outerRootSpan = new RootSpan()
      const outerChildSpan = new ChildSpan(outerRootSpan)
      const innerRootSpan = new RootSpan()

      scopeManager.setRoot(outerRootSpan)
      expect(scopeManager.active()).toBe(outerRootSpan)
      expect(scopeManager.root()).toBe(outerRootSpan)

      scopeManager.withContext(outerChildSpan, () => {
        expect(scopeManager.active()).toBe(outerChildSpan)
        expect(scopeManager.root()).toBe(outerRootSpan)
        scopeManager.setRoot(innerRootSpan)
        expect(scopeManager.root()).toBe(innerRootSpan)
      })

      expect(scopeManager.active()).toBe(outerRootSpan)
      expect(scopeManager.root()).toBe(innerRootSpan)
    })

    it("does not restore the active span if it is closed", () => {
      const rootSpan = new RootSpan()
      const activeSpan1 = new ChildSpan(rootSpan)
      const activeSpan2 = new ChildSpan(rootSpan)

      scopeManager.setRoot(rootSpan)
      expect(scopeManager.active()).toBe(rootSpan)

      scopeManager.withContext(activeSpan1, () => {
        expect(scopeManager.active()).toBe(activeSpan1)
        scopeManager.withContext(activeSpan2, () => {
          activeSpan1.close()
          expect(scopeManager.active()).toBe(activeSpan2)
        })
        expect(scopeManager.active()).toBeUndefined()
      })

      expect(scopeManager.active()).toBe(rootSpan)
    })
  })

  describe(".bindContext()", () => {
    it("propagates context to bound functions", () => {
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

    it("inherits the given function's length and name", () => {
      function add(x: number, y: number) {
        return x + y
      }
      const boundFn = scopeManager.bindContext(add)

      expect(boundFn.length).toEqual(2)
      expect(boundFn.name).toEqual("add")
    })
  })

  describe(".active()", () => {
    it("when active span is still open, it returns the active span", () => {
      const root = new RootSpan({ namespace: "root" })
      scopeManager.setRoot(root)
      expect(root.open).toBeTruthy()

      const span = scopeManager.active()
      expect(span).toBeDefined()
      expect(span?.traceId).toBeDefined()
      expect(span?.toObject().namespace).toEqual("root")
    })

    it("when active span is closed, it returns undefined", () => {
      const root = new RootSpan({ namespace: "root" })
      scopeManager.setRoot(root)
      root.close()
      expect(root.open).toBeFalsy()

      const span = scopeManager.active()
      expect(span).toBeUndefined()
    })
  })

  describe(".emitWithContext()", () => {
    let eventEmitter: EventEmitter
    let listener: jest.Mock

    beforeEach(() => {
      eventEmitter = new EventEmitter()
      listener = jest.fn(() => scopeManager.active())
      scopeManager.emitWithContext(eventEmitter)
    })

    it("can add event listeners", () => {
      eventEmitter.on("test", listener)

      eventEmitter.emit("test")
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it("can remove event listeners", () => {
      eventEmitter.on("test", listener)
      eventEmitter.off("test", listener)

      eventEmitter.emit("test")
      expect(listener).not.toHaveBeenCalled()
    })

    it("binds event listeners to the active span of the scope that adds them", async () => {
      const rootSpan = new RootSpan()
      scopeManager.setRoot(rootSpan)

      const listenerSpan = new ChildSpan(rootSpan)
      await asyncTaskWithContext(scopeManager, listenerSpan, () => {
        eventEmitter.on("test", listener)
      })

      eventEmitter.emit("test")
      expect(listener).toHaveBeenCalledTimes(1)
      expect(listener.mock.results[0].value).toBe(listenerSpan)
    })

    it("can bind the same event and callback to different active spans", async () => {
      const firstSpan = new RootSpan()
      await asyncTaskWithContext(scopeManager, firstSpan, () => {
        eventEmitter.on("test", listener)
      })

      const secondSpan = new RootSpan()
      await asyncTaskWithContext(scopeManager, secondSpan, () => {
        eventEmitter.on("test", listener)
      })

      eventEmitter.emit("test")
      expect(listener).toHaveBeenCalledTimes(2)
      expect(listener.mock.results[0].value).toBe(firstSpan)
      expect(listener.mock.results[1].value).toBe(secondSpan)
    })

    it("removes event listeners from before .emitWithContext was called", () => {
      eventEmitter = new EventEmitter()
      eventEmitter.on("test", listener)

      scopeManager.emitWithContext(eventEmitter)
      eventEmitter.on("test", listener)

      eventEmitter.emit("test")
      expect(listener).toHaveBeenCalledTimes(2)
      listener.mockClear()

      eventEmitter.off("test", listener)

      eventEmitter.emit("test")
      expect(listener).toHaveBeenCalledTimes(1)
      listener.mockClear()

      eventEmitter.off("test", listener)

      eventEmitter.emit("test")
      expect(listener).not.toHaveBeenCalled()
    })
  })
})

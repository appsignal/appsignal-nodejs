import { ScopeManager } from "../scope"
import { RootSpan, ChildSpan } from "../span"

describe("ScopeManager", () => {
  let scopeManager: ScopeManager

  beforeEach(() => {
    scopeManager = new ScopeManager()
    scopeManager.enable()
  })

  afterEach(() => {
    scopeManager.disable()
  })

  describe(".enable()", () => {
    it("should work", () => {
      expect(() => {
        scopeManager = new ScopeManager()
        expect(scopeManager.enable()).toEqual(scopeManager)
      }).not.toThrow()
    })
  })

  describe(".disable()", () => {
    it("should work", () => {
      expect(() => {
        expect(scopeManager.disable()).toEqual(scopeManager)
      }).not.toThrow()

      scopeManager.enable()
    })
  })

  describe(".withContext()", () => {
    it("should run the callback (null as target)", done => {
      scopeManager.withContext(null!, done)
    })

    it("should run the callback (object as target)", done => {
      const test = new RootSpan({ namespace: "test" })

      scopeManager.withContext(test, () => {
        expect(scopeManager.active()).toStrictEqual(test)
      })

      return done()
    })

    it("should run the callback (when disabled)", done => {
      scopeManager.disable()

      scopeManager.withContext(null!, () => {
        scopeManager.enable()
      })

      return done()
    })

    it("should rethrow errors", done => {
      const err = new Error("This should be rethrown")

      expect(() =>
        scopeManager.withContext(null!, () => {
          throw err
        })
      ).toThrow(err)

      return done()
    })

    it("should finally restore an old scope", done => {
      const rootSpan = new RootSpan()
      const scope1 = new ChildSpan(rootSpan)
      const scope2 = new ChildSpan(rootSpan)

      scopeManager.withContext(scope1, () => {
        expect(scopeManager.active()).toStrictEqual(scope1)

        scopeManager.withContext(scope2, () => {
          expect(scopeManager.active()).toStrictEqual(scope2)
        })

        expect(scopeManager.active()).toStrictEqual(scope1)

        return done()
      })

      expect(scopeManager.active()).toStrictEqual(scopeManager.root())
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

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
      const test = new RootSpan("test")

      scopeManager.withContext(test, () => {
        expect(scopeManager.active()).toStrictEqual(test)
        return done()
      })
    })

    it("should run the callback (when disabled)", done => {
      scopeManager.disable()

      scopeManager.withContext(null!, () => {
        scopeManager.enable()
        return done()
      })
    })

    it("should rethrow errors", done => {
      expect(() =>
        scopeManager.withContext(null!, () => {
          throw new Error("This should be rethrown")
        })
      ).rejects

      return done()
    })

    it("should finally restore an old scope", done => {
      const scope1 = new RootSpan("scope1")
      const scope2 = new RootSpan("scope2")

      scopeManager.withContext(scope1, () => {
        expect(scopeManager.active()).toStrictEqual(scope1)

        scopeManager.withContext(scope2, () => {
          expect(scopeManager.active()).toStrictEqual(scope2)
        })

        expect(scopeManager.active()).toStrictEqual(scope1)

        return done()
      })
    })
  })
})

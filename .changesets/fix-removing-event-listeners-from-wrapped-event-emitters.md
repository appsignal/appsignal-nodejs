---
bump: "patch"
type: "fix"
---

Fix removing event listeners from wrapped event emitters. When using
`tracer.wrapEmitter` to wrap an event emitter, it was not possible to remove
any listeners that were added after the event emitter was wrapped.

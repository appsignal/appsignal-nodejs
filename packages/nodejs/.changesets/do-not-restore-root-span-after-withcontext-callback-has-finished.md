---
bump: "patch"
type: "change"
---

Do not restore root span after `withSpan` callback has finished. Previously the root span was restored to the original root span before the `withSpan` helper was called. This has been changed, because the `withSpan` helper is only about changing the active span, not the root span. If a new root span has been set within a `withSpan` helper callback, the root span will no longer be restored. We recommend setting a new root span before calling `withSpan` instead.

```js
const rootSpan = tracer.rootSpan()
const span = tracer.createSpan(...)
tracer.withSpan(span, function(span) {
  tracer.createRootSpan(...)
});
// No longer match
rootSpan != tracer.rootSpan()
```

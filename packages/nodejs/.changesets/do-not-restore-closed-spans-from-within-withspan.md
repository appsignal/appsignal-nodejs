---
bump: "patch"
type: "change"
---

Do not restore closed spans from within the `withSpan` helper. If a previously active span gets closed while `withSpan` has another span as currently active, do not restore the closed span when the callback has finished.

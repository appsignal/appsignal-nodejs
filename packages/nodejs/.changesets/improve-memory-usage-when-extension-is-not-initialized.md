---
bump: "patch"
type: "change"
---

Improve memory usage when extension is not initialized. It will no longer initialize a new empty Tracer object when the extension is not loaded or AppSignal is not active.

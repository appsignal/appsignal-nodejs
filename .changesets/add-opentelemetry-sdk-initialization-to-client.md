---
bump: "patch"
type: "add"
---

Add OpenTelemetry SDK initialization helper function

The OpenTelemetry instrumentations are loaded async, this is OK when users rely on automatic instrumentations, but for custom instrumentations
it might cause spans not to be reported. There's a new helper function that contains the instrumentations registration that can be awaited for resolution before running any custom instrumentations.

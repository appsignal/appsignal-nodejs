---
bump: "patch"
type: "fix"
---

The minutely probes are now stopped when `Appsignal.stop()` is called. This fixes an issue where Jest tests would warn about asynchronous operations that remain pending after the tests.

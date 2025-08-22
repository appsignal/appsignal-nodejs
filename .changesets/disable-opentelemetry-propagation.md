---
bump: minor
type: change
---

Disable the OpenTelemetry propagation across applications. If multiple applications are instrumented with AppSignal for Node.js using OpenTelemetry, the propagation across applications could lead to application data being reported the wrong application in AppSignal.

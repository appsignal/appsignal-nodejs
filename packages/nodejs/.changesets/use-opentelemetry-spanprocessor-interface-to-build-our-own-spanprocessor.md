---
bump: "patch"
type: "change"
---

Use the OpenTelemetry SpanProcessor interface to build our own SpanProcessor. We previously copied the SpanProcessor code into our package, but instead we now use the OpenTelemetry interface directly. This should make our processor match the expected type better.

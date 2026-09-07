---
bump: patch
type: fix
---

Do not emit B3 trace context propagation headers. If you relied on AppSignal to
send the trace context in the `b3` or `x-b3-*` headers, you can configure that
yourself by passing your own `textMapPropagator` to the OpenTelemetry SDK.

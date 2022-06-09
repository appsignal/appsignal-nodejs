---
bump: "patch"
type: "change"
---

Support OpenTelemetry root spans in SpanProcessor. This change makes AppSignal instrumentation (like Express/Koa.js/Next.js) no longer a requirement. In fact you will need to use the OpenTelemetry instrumentation for those libraries from now on.

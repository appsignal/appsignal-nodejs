---
bump: "patch"
type: "fix"
---

Add `@opentelemetry/sdk-trace-base` package runtime dependency. Our OpenTelemetry SpanProcessor needs this package at runtime, not just at compile time.

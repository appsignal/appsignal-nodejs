---
bump: patch
type: change
integrations:
- nodejs
- python
---

Allow overriding namespaces that are automatically set by the AppSignal agent based on the OpenTelemetry instrumentation that emitted the span, such as the `graphql` or `background` namespaces.

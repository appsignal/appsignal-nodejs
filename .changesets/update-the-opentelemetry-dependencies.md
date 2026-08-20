---
bump: minor
type: change
---

Update the bundled OpenTelemetry packages to their current versions. This
resolves two reported vulnerabilities:

- CVE-2026-59892 in `@opentelemetry/propagator-jaeger`, which this integration
  does not use but did bundle through `@opentelemetry/sdk-node`.
- CVE-2026-54285 in `@opentelemetry/core`, which applies to the W3C baggage
  propagation that this integration does use.

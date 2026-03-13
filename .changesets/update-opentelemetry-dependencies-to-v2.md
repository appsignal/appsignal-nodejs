---
bump: minor
type: change
---

Update OpenTelemetry dependencies to v2. All bundled OpenTelemetry packages have been updated to their OpenTelemetry v2-compatible versions. This resolves compatibility issues when third-party span processors or instrumentations are used alongside AppSignal, which could cause spans to silently drop due to v1/v2 incompatibilities. The `@opentelemetry/instrumentation-redis-4` package has been removed. Redis v4 instrumentation is now handled by `@opentelemetry/instrumentation-redis`, which supports both Redis v3 and v4.

---
bump: minor
type: add
integrations: nodejs
---

Report queue events from applications that use BullMQ's own telemetry, which is
what BullMQ version 6 and newer offer through the `bullmq-otel` package. These
were previously reported as uncategorised events named after the raw span,
because BullMQ describes its spans with its own attributes rather than the
OpenTelemetry messaging conventions. They are now named and categorised the same
way as events from the `@appsignal/opentelemetry-instrumentation-bullmq` package.

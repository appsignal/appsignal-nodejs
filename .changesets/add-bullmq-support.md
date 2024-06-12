---
bump: patch
type: add
integrations: nodejs
---

Add BullMQ support through the `@appsignal/opentelemetry-instrumentation-bullmq` instrumentation. AppSignal will automatically instrument the use of BullMQ in your application.

Calls to functions that enqueue jobs, such as `Queue.add` and others, will be instrumented as an event in the event timeline for the performance sample in which it takes place.

When a BullMQ `Worker` processes a job, this will result in a performance sample in the `background` namespace.

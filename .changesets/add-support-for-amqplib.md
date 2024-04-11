---
bump: "patch"
type: "add"
---

The AMQP protocol is now instrumented when using amqplib. The AppSignal client automatically instruments and creates spans when using `amqplib`. Packages using amqplib such as Rascal are supported.

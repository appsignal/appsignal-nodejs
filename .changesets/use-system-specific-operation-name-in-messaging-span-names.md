---
bump: patch
type: change
integrations: [nodejs, python]
---

Use system-specific operation name in messaging span names.

When `messaging.operation.name` is present (e.g. `Queue.add`), it is used directly as the span name prefix: `Queue.add (myQueue)`. When only the generic `messaging.operation.type` is available (e.g. `send`), the word "message" is added for clarity: `send message (myQueue)`.

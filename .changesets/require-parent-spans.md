---
bump: patch
type: change
---

Require parent spans on database and outgoing HTTP instrumentations that support it. When a database query is performed using the `ioredis`, `pg`, `redis` or `mongoose` libraries, or when an outgoing HTTP request is performed using the `http` module, a span will only be created if a trace has already been started in the current active context, that is, if the span to be created would have a parent.

This helps prevent database queries and outgoing HTTP requests happening in uninstrumented contexts from counting towards your requests quota.
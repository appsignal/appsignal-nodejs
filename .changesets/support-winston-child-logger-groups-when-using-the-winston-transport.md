---
bump: "patch"
type: "add"
---

Support Winston child logger groups when using the Winston transport

When using the Winston transport for our logging feature, the child loggers with an assigned group
will send the group to AppSignal when logging messages.

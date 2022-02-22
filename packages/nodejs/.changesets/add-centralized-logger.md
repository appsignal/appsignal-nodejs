---
bump: "patch"
type: "add"
---

Log messages are now sent through a new centralized logger that writes to `/tmp/appsignal.log` by default.
A warning is printed to STDERR when the default or provided logPath is not accessible, and the Logger
automatically falls back to STDOUT. Use config option `log: stdout` to log AppSignal messages to STDOUT instead.

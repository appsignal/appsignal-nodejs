---
bump: "patch"
---

The logPath config option only allows writable paths. If the provided path is not writable,
it'll automatically change to the Operating System's temporary directory (`/tmp`).

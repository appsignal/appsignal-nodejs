---
bump: "patch"
type: "fix"
---

Add a hostname tag to V8 probe metrics. This fixes an issue where metrics' values
would be overriden between different hosts.

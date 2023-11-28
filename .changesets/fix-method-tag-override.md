---
bump: "patch"
type: "fix"
---

Fix an issue where the `method` tag extracted from an incoming HTTP request span would be overriden with the method used for an outgoing HTTP request span.

---
bump: "patch"
type: "fix"
---

When instrumenting an outgoing HTTP request, read the `host` property from the request options if the `hostname` property is not present. This fixes a bug where outgoing HTTP request hosts would be shown as `http://localhost`. 

---
bump: "patch"
type: "fix"
---

Do not break requests using legacy generator middleware. Before this change, using a generator middleware, which are deprecated, would make our instrumentation break the request by not calling the next middleware in the chain. This change fixes this by not instrumenting generator middleware.

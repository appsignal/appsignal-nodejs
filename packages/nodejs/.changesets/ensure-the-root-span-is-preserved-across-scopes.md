---
bump: "patch"
type: "fix"
---

Ensure the root span is preserved across scopes. Due to a bug in the scope management logic, calling `tracer.withSpan` could cause the root span for a given scope to be forgotten.

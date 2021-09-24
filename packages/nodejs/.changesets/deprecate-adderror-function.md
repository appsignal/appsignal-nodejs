---
bump: "patch"
---

Deprecate the addError function on the Span interface. Instead use the Tracer's `setError` function to set the error on the root span.

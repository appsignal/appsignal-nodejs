---
bump: "patch"
---

Deprecate addError helper for spans

Errors are now added through the tracer in the integration
using the setError function. span.addError() is not used anymore.

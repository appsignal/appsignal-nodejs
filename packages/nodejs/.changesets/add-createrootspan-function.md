---
bump: "patch"
type: "add"
---

Add the `createRootSpan` function to the Tracer to allow explicit creation of RootSpans even if another RootSpan already exists and is tracked as the current RootSpan. Make sure to not forget about the previous RootSpan, and close it as well at some point when using this function.

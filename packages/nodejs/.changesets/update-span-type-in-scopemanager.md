---
bump: "patch"
type: "change"
---

Update the expected Span type in ScopeManager to `Span` from the `@appsignal/nodejs` package, rather than the `NodeSpan` from the `@appsignal/types` package. The type definition is the same, but now all Span types used by the Node.js integration are defined in the `@appsigna/nodejs` package.

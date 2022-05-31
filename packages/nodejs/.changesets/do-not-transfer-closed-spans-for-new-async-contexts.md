---
bump: "patch"
type: "fix"
---

Do not transfer closed spans for new async contexts in the ScopeManager. Rather than relying on `ScopeManager.active()` and `ScopeManager.root()` to make sure the span is not already closed, also make sure it's not closed when transferring spans around between async contexts.

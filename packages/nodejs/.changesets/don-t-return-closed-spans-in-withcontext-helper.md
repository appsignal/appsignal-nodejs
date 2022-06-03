---
bump: "patch"
type: "fix"
---

Don't return closed spans in `withSpan` helper. If a closed span was given to the `witSpan` helper it would temporarily overwrite the context with a closed span that cannot be modified. Instead it will return the current active span, if any. If no span was active it will return a `NoopSpan`.

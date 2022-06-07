---
bump: "patch"
type: "fix"
---

Only allow open root spans to be set as root. This avoids closed root spans to be reused in child contexts.

---
bump: "patch"
type: "change"
---

Remove `route` tag from HTTP server spans. Since the span will already have the route attribute as part of its name, the tag is redundant.

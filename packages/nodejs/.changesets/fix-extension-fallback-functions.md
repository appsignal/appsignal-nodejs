---
bump: "patch"
type: "fix"
---

Fix the extension function fallbacks on installation failure. When the extension fails to install and calls are made to the not loaded functions, it will no longer throw an error.

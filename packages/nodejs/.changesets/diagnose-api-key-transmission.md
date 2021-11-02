---
bump: "patch"
---

Fix diagnose report recognition when sent to the server. It was sent without an `api_key` parameter, which resulted in apps not being linked to the parent organization based on the known Push API key.

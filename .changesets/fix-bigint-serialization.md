---
bump: patch
type: fix
integrations: all
---

Fix BigInt serialization crash in helper functions. BigInt values passed to `setCustomData`, `setParams`, or `setSessionData` no longer throw a TypeError.

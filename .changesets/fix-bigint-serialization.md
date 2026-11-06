---
bump: patch
type: fix
---

Fix a crash when `setCustomData`, `setParams` or `setSessionData` is called with
a value that contains a `BigInt`.  `BigInt` values are now stored as
`"bigint:<n>"`, the same format used for metric tags and log attributes.

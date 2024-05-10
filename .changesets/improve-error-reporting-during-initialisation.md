---
bump: "patch"
type: "change"
---

### Improve error reporting during initialisation

Do not report an error with the extension installation when AppSignal is imported -- instead, report it when attempting to initialise AppSignal. Do not report an error with the extension if AppSignal is not configured to be active.

When AppSignal does not start due to its configuration (`active` is set to `false`, or the push API key is missing) report the specific reason why.

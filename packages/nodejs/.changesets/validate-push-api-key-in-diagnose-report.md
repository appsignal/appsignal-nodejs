---
bump: "patch"
---

Fix the validation of Push API key in the diagnose report. It would always print "valid" even if the key was not set or invalid.

---
bump: "patch"
---

Fix the checksum verification failure on extension installation. If the download checksum verification failed it would not write a diagnose report and it would be difficult to debug the cause for the AppSignal team.

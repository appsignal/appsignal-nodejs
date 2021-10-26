---
bump: "patch"
---

Fix sending the agent diagnose report with all reports. It was sent, but with the wrong key, which made our server side validator report it as missing.

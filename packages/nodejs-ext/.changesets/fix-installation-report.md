---
bump: "patch"
---

Fix installation report result. The installation report would report always "unknown" previously, now it will accurately report success and failure results. This will help the AppSignal team debug issues when the report is sent along with the diagnose report.

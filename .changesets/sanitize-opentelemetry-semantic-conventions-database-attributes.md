---
bump: patch
type: change
integrations:
- standalone
- nodejs
- python
---

Update span recognition following the OpenTelemetry Semantic Conventions 1.30 database specification. We now also sanitize SQL queries in the `db.query.text` attribute and Redis queries in the `db.operation.name` attribute.

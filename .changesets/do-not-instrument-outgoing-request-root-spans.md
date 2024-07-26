---
bump: patch
type: fix
integrations:
- nodejs
- python
---

Do not instrument outgoing HTTP request root spans. Only instrument outgoing HTTP requests in the context of a broader trace, that is, when they have a parent span.

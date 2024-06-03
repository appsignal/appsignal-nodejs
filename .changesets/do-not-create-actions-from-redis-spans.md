---
bump: patch
type: fix
integrations: nodejs
---

Do not create actions from Redis spans. Redis spans without a parent span will be ignored.


---
bump: patch
type: fix
integrations: nodejs
---

Report the queue name on BullMQ events as the `queue` tag. It was being reported
as the `message_destination` tag instead.

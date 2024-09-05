---
bump: patch
type: change
---

Do not block Node.js shutdown. It is no longer necessary to call `Appsignal.stop` for the Node.js engine to allow itself to shut down. It should still be called and awaited in production scenarios and at the end of scripts, as it ensures that scheduled check-ins are delivered.

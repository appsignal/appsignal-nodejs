---
bump: "patch"
type: "fix"
---

Do not instrument HTTP requests to the default socket.io path. This works around an issue where our HTTP instrumentation breaks socket.io's server side, causing the client side to get stuck in a connection loop.

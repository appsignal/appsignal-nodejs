---
bump: patch
type: change
---

Rename heartbeats to cron check-ins. Calls to `Appsignal.heartbeat` and `Appsignal.Heartbeat` should be replaced with calls to `Appsignal.checkIn.cron` and `Appsignal.checkIn.Cron`, for example:

```js
// Before
import { heartbeat } from "@appsignal/nodejs"

heartbeat("do_something", () => {
  do_something()
})

// After
import { checkIn } from "@appsignal/nodejs"

checkIn.cron("do_something", () => {
  do_something
})
```

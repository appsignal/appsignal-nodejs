---
bump: minor
type: add
---

Add support for heartbeat check-ins.

Use the `checkIn.heartbeat` method to send a single heartbeat check-in event from your application. This can be used, for example, in your application's main loop:

```js
import { checkIn } from "@appsignal/nodejs"

while (true) {
  checkIn.heartbeat("job_processor")
  await processJob()
}
```

Heartbeats are deduplicated and sent asynchronously, without blocking the current thread. Regardless of how often the `.heartbeat` method is called, at most one heartbeat with the same identifier will be sent every ten seconds.

Pass `{continuous: true}` as the second argument to send heartbeats continuously during the entire lifetime of the current process. This can be used, for example, after your application has finished its boot process:

```js
import { checkIn } from "@appsignal/nodejs"

function main() {
  checkIn.heartbeat("job_processor", {continuous: true})
  startApp()
}
```

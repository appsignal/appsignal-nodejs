---
bump: "minor"
type: "add"
---

_Heartbeats are currently only available to beta testers. If you are interested in trying it out, [send an email to support@appsignal.com](mailto:support@appsignal.com?subject=Heartbeat%20beta)!_

---

Add heartbeats support. You can send heartbeats directly from your code, to
track the execution of certain processes:

```javascript
import { heartbeat } from "@appsignal/nodejs"

function sendInvoices() {
  // ... your code here ...
  heartbeat("send_invoices")
}
```

You can pass a function to `heartbeat`, to report to AppSignal both when the
process starts, and when it finishes, allowing you to see the duration of the
process:

```javascript
import { heartbeat } from "@appsignal/nodejs"

function sendInvoices() {
  heartbeat("send_invoices", () => {
    // ... your code here ...
  })
}
```

If an exception is raised within the function, the finish event will not be
reported to AppSignal, triggering a notification about the missing heartbeat.
The exception will bubble outside of the heartbeat function.

If the function passed to `heartbeat` returns a promise, the finish event will
be reported to AppSignal if the promise resolves. This means that you can use
heartbeats to track the duration of async functions:

```javascript
import { heartbeat } from "@appsignal/nodejs"

async function sendInvoices() {
  await heartbeat("send_invoices", async () => {
    // ... your async code here ...
  })
}
```

If the promise is rejected, or if it never resolves, the finish event will
not be reported to AppSignal.

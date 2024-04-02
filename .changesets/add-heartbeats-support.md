---
bump: "patch"
type: "add"
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

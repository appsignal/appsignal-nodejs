---
bump: "patch"
type: "change"
---

`Appsignal.stop()` now returns a promise. For your application to wait until
AppSignal has been gracefully stopped, this promise must be awaited:

```javascript
import { Appsignal } from "@appsignal/nodejs"

await Appsignal.stop()
process.exit(0)
```

In older Node.js versions where top-level await is not available, terminate
the application when the promise is settled:

```javascript
import { Appsignal } from "@appsignal/nodejs"

Appsignal.stop().finally(() => {
  process.exit(0)
})
```

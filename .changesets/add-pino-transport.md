---
bump: patch
type: add
---

A Pino transport is now available. If Pino is your main logger, you can now use the AppSignal pino transport to send those logs to AppSignal.

```js
import pino from "pino"
import { Appsignal, AppsignalPinoTransport } from "@appsignal/nodejs"

const logger = pino(
  AppsignalPinoTransport({
    client: Appsignal.client,
    group: "application",
  })
)
```

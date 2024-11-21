---
bump: patch
type: fix
---

Allow Pino transport to be used as a transport. Before, our Pino transport could only be used as a destination:

```js
import pino from "pino";
import { Appsignal, AppsignalPinoTransport } from "@appsignal/nodejs";

pino(AppsignalPinoTransport({
  client: Appsignal.client,
  group: "pino"
}));
```

This meant it was not possible to log both to our transport and to another destination.

Now, it is also possible to use it as a Pino transport, with the `transport` Pino config option or the `pino.transport()` function:

```js
import pino from "pino";

pino({
  transport: {
    target: "@appsignal/nodejs/pino",
    options: {
      group: "pino"
    }
  }
});
```

It is no longer necessary to pass the AppSignal client to the Pino transport. AppSignal must be active for the Pino transport to work.

By enabling its use as a transport, it is now possible to use it alongside other transports:

```js
pino({
  transport: {
    targets: [
      // Send logs to AppSignal...
      { target: "@appsignal/nodejs/pino" },
      // ... and to standard output!
      { target: "pino/file" }
    ]
  }
});
```

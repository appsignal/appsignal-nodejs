---
bump: "patch"
type: "add"
---

Add `initializeOpentelemetrySdk` configuration option. This allows those who
would rather take control of how OpenTelemetry is initialised in their
application to skip AppSignal's initialization of the OpenTelemetry SDK.

This is not the recommended way to use AppSignal for Node.js. Only use this
config option if you're really sure that you know what you're doing.

When initialising OpenTelemetry, it is necessary to add the AppSignal span
processor in order for data to be sent to AppSignal. For example, using the
OpenTelemetry SDK:

```js
import { SpanProcessor, Appsignal } from "@appsignal/nodejs";
// or: const { SpanProcessor, Appsignal } = require("@appsignal/nodejs")

const sdk = new NodeSDK({
  spanProcessor: new SpanProcessor(Appsignal.client)
});

sdk.start()
```

The above snippet assumes that the AppSignal client has been initialised
beforehand. For an optimal experience with AppSignal, those making use of this
config option should configure their OpenTelemetry instrumentation in a
similar way as it is done in the AppSignal integration's source code.

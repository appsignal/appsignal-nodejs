---
bump: "patch"
type: "add"
---

Add `initializeOpentelemetrySdk` configuration option. This allows those who
would rather take control of how OpenTelemetry is initialised in their
application to skip AppSignal's initialization of the OpenTelemetry SDK.

Additionally, add an `opentelemetryInstrumentations` method on the client,
which returns AppSignal's default OpenTelemetry instrumentations, already
configured to work correctly with AppSignal. The provided list of
instrumentations will follow the `additionalInstrumentations` and
`disableDefaultInstrumentations` config options, if those are set.

This is not the recommended way to use AppSignal for Node.js. Only use this
config option and this method if you're really sure that you know what
you're doing.

When initialising OpenTelemetry, it is necessary to add the AppSignal span
processor in order for data to be sent to AppSignal. For example, using the
OpenTelemetry SDK:

```js
import { SpanProcessor, Appsignal } from "@appsignal/nodejs";
// or: const { SpanProcessor, Appsignal } = require("@appsignal/nodejs")

const sdk = new NodeSDK({
  spanProcessor: new SpanProcessor(Appsignal.client)
  instrumentations: Appsignal.client.opentelemetryInstrumentations()
});

sdk.start()
```

The above snippet assumes that the AppSignal client has been initialised
beforehand.

When making use of this config option, the OpenTelemetry instrumentations
must be configured in the same way as it is done in the AppSignal integration.
In the above snippet, the `instrumentations` property in the OpenTelemetry SDK
is set to the AppSignal client's list of OpenTelemetry instrumentations, which
are configured to work correctly with AppSignal.

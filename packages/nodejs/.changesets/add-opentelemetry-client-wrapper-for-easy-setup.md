---
bump: "patch"
type: "add"
---

Add an OpenTelemetry client wrapper for easy setup. This client preconfigures the Appsignal client for better compatibility with our OpenTelemetry integration. It disables the auto instrumentation from the AppSignal package in favor other of the OpenTelemetry instrumentation.

If you previously have set up AppSignal like the example below, please change the import from `Appsignal` to `OpenTelemetryClient as Appsignal`:

```js
// appsignal.js
// Remove this old import:
// const { Appsignal } = require("@appsignal/nodejs")

// Change the line to this import:
const { AppsignalOpenTelemetry } = require("@appsignal/nodejs");

// Update `Appsignal` to `AppsignalOpenTelemetry`:
const appsignal = new AppsignalOpenTelemetry({
  // Your config
  // If this previously contained any of the following config options, remove them: instrumentHttp, instrumentRedis, instrumentPg
});

module.exports = { appsignal };
```

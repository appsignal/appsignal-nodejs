---
bump: "patch"
type: "add"
---

Add OpenTelemetry node-redis and ioredis query sanitizers. We recommend using these sanitizers to ensure no sensitive data is sent in query statements. Add the sanitizer to the `dbStatementSerializer` config as demonstrated below.

```js
// tracing.js
// Add the RedisDbStatementSerializer import
const { RedisDbStatementSerializer } = require("@appsignal/nodejs");
const { RedisInstrumentation } = require("@opentelemetry/instrumentation-redis");
const sdk = new opentelemetry.NodeSDK({
  instrumentations: [
    new RedisInstrumentation({
      // Configure the AppSignal RedisDbStatementSerializer to sanitize queries
      dbStatementSerializer: RedisDbStatementSerializer
    })
  ]
});
```

The same can be done for the ioredis instrumentation:

```js
// tracing.js
// Add the IORedisDbStatementSerializer import
const { IORedisDbStatementSerializer } = require('@appsignal/nodejs');
const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
const sdk = new opentelemetry.NodeSDK({
  instrumentations: [
    // Add the IORedisInstrumentation
    new IORedisInstrumentation({
      // Configure the AppSignal IORedisDbStatementSerializer to sanitize queries
      dbStatementSerializer: IORedisDbStatementSerializer
    })
  ]
});
```

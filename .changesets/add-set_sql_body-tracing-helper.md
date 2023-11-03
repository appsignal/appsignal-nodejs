---
bump: "patch"
type: "add"
---

Add the `setSqlBody` tracing helper to set the body attribute on a span that contains a SQL query. When using this helper the given SQL query will be sanitized, reducing the chances of sending sensitive data to AppSignal.

```js
import { setSqlBody } from "@appsignal/nodejs";

// Must be used in an instrumented context -- e.g. an Express route
setSqlBody("SELECT * FROM users WHERE 'password' = 'secret'");
// Will be stored as: "SELECT * FROM users WHERE 'password' = ?"
```

When the `setBody` helper is also used, the `setSqlBody` overwrites the `setBody` attribute.

More information about our [tracing helpers](https://docs.appsignal.com/nodejs/3.x/instrumentation/instrumentation.html) can be found in our documentation.

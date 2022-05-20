---
bump: "patch"
type: "add"
---

Add config options for disabling default instrumentation like HTTP, HTTPS, PostgreSQL (pg package) and Redis (node-redis package).

The following configuration options have been added:

- `instrumentHttp`
- `instrumentHttps`
- `instrumentPg`
- `instrumentRedis`

By default these configuration options are set to `true`, which means the instrumentation is active by default. If you want to disable one of these instrumentations, configure it by setting the configuration option to `false`.

```js
// appsignal.js
// Brief example, see our docs for a full example

const appsignal = new Appsignal({
  instrumentRedis: false // Disables the node-redis package instrumentation
});
```

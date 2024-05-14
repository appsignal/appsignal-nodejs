---
bump: "patch"
integrations: "nodejs"
type: "add"
---

Instrument calls to `fetch` in Node.js. Requests made using Node.js' global `fetch`, or through the underlying `undici` library, will be automatically instrumented and shown as events in your performance samples' event timeline.

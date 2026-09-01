---
bump: patch
type: fix
integrations: nodejs
---

Keep naming MongoDB events after the operation they perform when the
`@opentelemetry/instrumentation-mongodb` package is version 0.74.0 or newer.
That version renames its spans to follow the stable database semantic
conventions, and events from it were being named `unknown.mongodb` as a result.

---
bump: "minor"
---

Add rootSpan and addError helpers.

Errors added to child spans are ignored by the agent. Now the rootSpan is
always accessible from the tracer object as well as addError. The addError
function allows to track errors on demand and they will be always attached
to the main current span, so they don't get ignored by the agent.

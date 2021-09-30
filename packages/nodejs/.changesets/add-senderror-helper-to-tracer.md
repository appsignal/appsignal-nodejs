---
bump: "patch"
---

Add sendError helper to Tracer object.

This new helper allows you to track an error separately from any other span
inside the current context. Or use it to set up in your own error handling to
report errors in a catch-statement if no performance monitoring is needed.

```js
try {
  // Do complex stuff
} catch (error) {
  appsignal.tracer().sendError(error, span => {
    span.setName("daily.task"); // Set a recognizable action name
    span.set("user_id", user_id); // Set custom tags
  });
}
```

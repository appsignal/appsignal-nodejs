---
bump: patch
type: change
---

Detect the log format automatically. We now detect if a log line is in the JSON, Logfmt, or plaintext format. No further config needed when calling our logger, like so: 

```javascript
const logger = Appsignal.logger("app");
logger.info("message");
```

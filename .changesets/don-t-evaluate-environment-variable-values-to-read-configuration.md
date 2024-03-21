---
bump: "patch"
type: "change"
---

Don’t evaluate environment variable values to read configuration

In previous versions of the Node.js integration, environment variables were evaluated to read their values. This version instead parses them based on their expected values.

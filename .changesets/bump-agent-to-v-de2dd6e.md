---
bump: "patch"
type: "change"
---

Bump agent to v-de2dd6e.

- Remove fallback for unknown span body. The notice about a missing extractor
  is now a trace level log.
- Filter root span attributes that are set as tags, params, headers, etc.
- Filter more root span attributes that can contain PII information.
- Improve http extractor span name to use `http.route` attribute to always
  build the incident action name. This should avoid new incidents with 
  `HTTP POST`-like naming.

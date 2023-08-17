---
bump: "patch"
type: "change"
---

Bump agent to version d789895.

- Increase short data truncation from 2000 to 10000 characters.
- Include HTTP request method on Next.js samples as incident action name. Instead of `/path` it will now report `GET /path`.
- Add a extractor for Remix js spans.

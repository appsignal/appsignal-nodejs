---
bump: "patch"
type: "fix"
---

Fix error on Microsoft Windows machines on install. The AppSignal extension still won't install on Windows, but now it won't cause an error while checking a development mode condition if it should build the TypeScript package.

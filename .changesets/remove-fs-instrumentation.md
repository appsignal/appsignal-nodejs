---
bump: "patch"
type: "remove"
---

Remove fs instrumentation by default. It's causing issues on some installations. It can be manually added as [described in our fs module docs](https://docs.appsignal.com/nodejs/3.x/integrations/fsmodule.html).

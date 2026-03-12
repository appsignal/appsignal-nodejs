---
bump: minor
type: change
---

Update Prisma instrumentation to v7. The `@prisma/instrumentation` package has been updated from v6 to v7. The `middleware` config option has been removed, as Prisma dropped its middleware API in Prisma v5. Prisma's native tracing is now the only supported instrumentation method.

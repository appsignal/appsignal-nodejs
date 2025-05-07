---
bump: patch
type: fix
---

Update `mysql2` and `pg` instrumentations. This fixes an issue where queries performed using promises with `mysql2@3.11.5` are not instrumented, as well as an issue where `pg` is not instrumented under certain bundlers and runtimes.

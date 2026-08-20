---
bump: patch
type: change
---

Allow any 1.x version of `@opentelemetry/api` from 1.9.0 onwards. This prevents
an issue where npm installs a second copy of the package for AppSignal alone,
which can stop spans from being reported without any error.

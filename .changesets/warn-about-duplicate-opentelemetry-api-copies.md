---
bump: patch
type: add
---

Warn when your application loads more than one version of
`@opentelemetry/api`, warning about potential data loss, as older versions
fail to send data through global values configured by newer versions.
The warning names the versions and where they were loaded from.

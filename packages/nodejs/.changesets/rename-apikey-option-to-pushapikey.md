---
bump: "patch"
---

Rename the `apiKey` option to `pushApiKey` to match other AppSignal integrations. If `apiKey` is set it will automatically set `pushApiKey`. The `apiKey` option will be removed in the next major version of this package.

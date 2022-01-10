---
bump: "patch"
type: "fix"
---

Setting `enableMinutelyProbes` to `false` now disables the minutely probes
system. Custom probes will not be called when the minutely probes are
disabled. In addition, the `APPSIGNAL_ENABLE_MINUTELY_PROBES` environment
variable can now be used to enable or disable the minutely probes.

Before this change, setting `enableMinutelyProbes` to `false` would not
register the default Node.js heap statistics minutely probe, but custom
probes would still be called. To opt in for the previous behaviour,
disabling only the Node.js heap statistics minutely probe without disabling
custom probes, you can use the `probes.unregister()` method to unregister
the default probe:

```js
const probes = appsignal.metrics().probes();
probes.unregister("v8_stats");
```

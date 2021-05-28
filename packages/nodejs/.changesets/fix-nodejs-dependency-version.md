---
bump: "patch"
---

Fix nodejs package dependency version lock. Due to a mono bug the `nodejs-ext` package was locked to version `1.2.5`, which isn't out yet, instead of `1.2.5-alpha.1`.

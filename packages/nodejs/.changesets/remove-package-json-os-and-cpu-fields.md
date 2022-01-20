---
bump: "patch"
type: "change"
---

Remove the `os` and `cpu` fields from the `package.json`. This will prevent installations from failing on unlisted CPU architectures and Operating Systems. Our extension installer script will do this check instead. The package should not fail to install when it encounters an unsupported CPU architecture or Operating System.

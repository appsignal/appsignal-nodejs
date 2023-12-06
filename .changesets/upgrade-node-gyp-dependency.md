---
bump: "patch"
type: "fix"
---

Fix compatibility issue with Node.js's node-gyp package and Python 3.12.0. Python 3.12.0 removed a package called "distutils", causing the extension to fail to install. Upgrade the node-gyp package with the fix for this issue.

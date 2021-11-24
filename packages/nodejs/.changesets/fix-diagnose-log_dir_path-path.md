---
bump: "patch"
---

Fix the diagnose's `log_dir_path` path check. It now always checks the actual log file's parent directory, rather than the configured path. These two values may differ as the package does a permission check to see if the `logPath` is writable or not.

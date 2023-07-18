---
bump: "patch"
type: "fix"
---

Remove agent download file after extraction. This save a couple megabytes of space that are no longer needed when the agent and extension have been extracted from the downloaded `.tar.gz` file, reducing the overall app size.

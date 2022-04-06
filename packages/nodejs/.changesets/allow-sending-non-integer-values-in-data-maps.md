---
bump: "patch"
type: "fix"
---

Fix an issue where the AppSignal extension would throw an error when an object containing a non-integer number is sent to it. This would be triggered when calling `setSampleData` with an object containing a non-integer number, or when the values for a metric's tags are non-integer numbers.

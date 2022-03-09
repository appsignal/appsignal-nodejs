---
bump: "patch"
type: "fix"
---

Allow nested values in `Span.setSampleData`. This change also allows
values other than strings, integers and booleans to be passed as values
within the sample data objects. Note that not all sample data keys allow
nested values to be passed.

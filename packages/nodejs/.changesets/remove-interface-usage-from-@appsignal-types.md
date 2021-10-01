---
bump: "minor"
---

Remove interface usage from @appsignal/types

All Node.js-specific interfaces from the types package are now defined
inside the nodejs core package. There's still a dependency from types
package for common types as Func, HashMap, and HasMapValue.

With this change, we keep taking advantage of interfaces, but now they're
defined in a place where they're used.

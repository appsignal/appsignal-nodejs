---
bump: patch
type: change
integrations:
- nodejs
- python
---

Rename the `hostname` tag, which contains the host of the URI that an HTTP request was made against, to `request_host`.

This fixes an issue where the `hostname` tag would later be internally overriden to the hostname of the machine processing the request, but notifications would still be emitted containing the previous `hostname` value.


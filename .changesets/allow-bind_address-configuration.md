---
bump: "patch"
type: "add"
---

Allow configuration of the agent's TCP and UDP servers using the `bindAddress` config option. This is by default set to `127.0.0.1`, which only makes it accessible from the same host. If you want it to be accessible from other machines, use `0.0.0.0` or a specific IP address.

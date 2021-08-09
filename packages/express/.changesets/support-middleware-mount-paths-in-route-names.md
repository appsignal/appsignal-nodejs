---
bump: "patch"
---

Support middleware mount paths in route names. Instead of only the path inside routes defined in a middleware being used to determine the action name, also include the mount path of the middleware. Something like this definition will now include the "/admin" prefix in the action names: `app.use("/admin", require("./admin"))`.

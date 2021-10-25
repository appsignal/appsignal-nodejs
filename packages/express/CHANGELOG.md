

## 1.0.14

- patch - Update @appsignal/nodejs dependency to 2.2.1.

## 1.0.13

- patch - Update @appsignal/nodejs dependency to 2.2.0.

## 1.0.12

- [1a6209b](https://github.com/appsignal/appsignal-nodejs/commit/1a6209bc1ec4b079a045ebd7be8ee44c34393350) patch - Support middleware mount paths in route names. Instead of only the path inside routes defined in a middleware being used to determine the action name, also include the mount path of the middleware. Something like this definition will now include the "/admin" prefix in the action names: `app.use("/admin", require("./admin"))`.

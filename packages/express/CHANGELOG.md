

## 1.0.20

### Changed

- patch - Update @appsignal/nodejs dependency to 2.2.7.

## 1.0.19

### Changed

- patch - Update @appsignal/nodejs dependency to 2.2.6.
- patch - Update @appsignal/nodejs dependency to 2.2.6.

## 1.0.18

- [4c11f36](https://github.com/appsignal/appsignal-nodejs/commit/4c11f36b292e090fd1dc2aa2ff7001b371bdb8cf) patch - Collect request headers from express requests by default. See also our new `requestHeaders` config
  option, added in the @appsignal/nodejs package.
- patch - Update @appsignal/nodejs dependency to 2.2.5.
- patch - Update @appsignal/nodejs dependency to 2.2.5.

## 1.0.17

- patch - Update @appsignal/nodejs dependency to 2.2.4.

## 1.0.16

- patch - Update @appsignal/nodejs dependency to 2.2.3.
- patch - Update @appsignal/nodejs dependency to 2.2.3.

## 1.0.15

- patch - Update @appsignal/nodejs dependency to 2.2.2.

## 1.0.14

- patch - Update @appsignal/nodejs dependency to 2.2.1.

## 1.0.13

- patch - Update @appsignal/nodejs dependency to 2.2.0.

## 1.0.12

- [1a6209b](https://github.com/appsignal/appsignal-nodejs/commit/1a6209bc1ec4b079a045ebd7be8ee44c34393350) patch - Support middleware mount paths in route names. Instead of only the path inside routes defined in a middleware being used to determine the action name, also include the mount path of the middleware. Something like this definition will now include the "/admin" prefix in the action names: `app.use("/admin", require("./admin"))`.

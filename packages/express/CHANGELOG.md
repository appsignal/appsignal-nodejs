

## 1.0.34

### Changed

- [7d73d53](https://github.com/appsignal/appsignal-nodejs/commit/7d73d53645b9ce642f7c8d3626c3ecb149bcb946) patch - Add warning to README about v2 and v3 compatibility.

## 1.0.33

### Changed

- patch - Update @appsignal/nodejs dependency to 2.4.2.

## 1.0.32

### Changed

- patch - Update @appsignal/nodejs dependency to 2.4.1.

## 1.0.31

### Changed

- patch - Update @appsignal/nodejs dependency to 2.4.0.

## 1.0.30

### Changed

- patch - Update @appsignal/nodejs dependency to 2.3.6.

### Fixed

- [1aaf0e3](https://github.com/appsignal/appsignal-nodejs/commit/1aaf0e38bc0a4fd09899652d68e0db70a799cf05) patch - HTTP Post requests were not sending the body params to AppSignal. They are now properly sent to the
  application.

## 1.0.29

### Changed

- patch - Update @appsignal/nodejs dependency to 2.3.5.

## 1.0.28

### Changed

- patch - Update @appsignal/nodejs dependency to 2.3.4.

## 1.0.27

### Changed

- patch - Update @appsignal/nodejs dependency to 2.3.3.

## 1.0.26

### Changed

- patch - Update @appsignal/nodejs dependency to 2.3.2.

## 1.0.25

### Changed

- patch - Update @appsignal/nodejs dependency to 2.3.1.

## 1.0.24

### Changed

- [ddc7e19](https://github.com/appsignal/appsignal-nodejs/commit/ddc7e19277409552db671e68bdfd88fea95e8f57) patch - Update package metadata to specify the package repository.
- patch - Update @appsignal/nodejs dependency to 2.3.0.

## 1.0.23

### Changed

- patch - Update @appsignal/nodejs dependency to 2.2.10.

## 1.0.22

### Changed

- patch - Update @appsignal/nodejs dependency to 2.2.9.

## 1.0.21

### Changed

- patch - Update @appsignal/nodejs dependency to 2.2.8.
- patch - Update @appsignal/nodejs dependency to 2.2.8.

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

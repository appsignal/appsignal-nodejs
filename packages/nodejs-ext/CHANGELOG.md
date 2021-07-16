# AppSignal for Node.js extension Changelog

## 1.2.6

- [8a26df7](https://github.com/appsignal/appsignal-nodejs/commit/8a26df7974dbb2751acf561890118e4fb6d1812e) patch - Add Linux ARM 64-bit experimental build, available behind a feature flag. To test this set the `APPSIGNAL_BUILD_FOR_LINUX_ARM` flag before compiling your apps: `export APPSIGNAL_BUILD_FOR_LINUX_ARM=1 <command>`. Please be aware this is an experimental build. Please report any issue you may encounter at our [support email](mailto:support@appsignal.com).

## 1.2.5

- [a55fd1f](https://github.com/appsignal/appsignal-nodejs/commit/a55fd1f0d7aedc1d06024031db80ee4543b332bf) patch - Package release.

## 1.2.5-alpha.1

- [a6a6393](https://github.com/appsignal/appsignal-nodejs/commit/a6a6393ca3d6e2d6cfb82e46615d78c47a7c6fde) patch - Update `APPSIGNAL_BUILD_FOR_MUSL` build flag to also listen to the value `1`,
  as is documented. Usage: `APPSIGNAL_BUILD_FOR_MUSL=1` and then run the
  `npm/yarn install` command.
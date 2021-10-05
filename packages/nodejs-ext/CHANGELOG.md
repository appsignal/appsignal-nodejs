# AppSignal for Node.js extension Changelog

## 2.0.1

- [6830d4a](https://github.com/appsignal/appsignal-nodejs/commit/6830d4a6ab10ac533e9ce2556d09ce887e9f9dd1) patch - Report a more accurate state of the AppSignal extension installation on failures. Useful for the AppSignal team when debugging.
- [8745424](https://github.com/appsignal/appsignal-nodejs/commit/874542478cbf45e11ea6cc8042cfe3abfec5c014) patch - Track AppSignal extension installation source in the installation report. Used by the AppSignal team when debugging.
- [bf11c4b](https://github.com/appsignal/appsignal-nodejs/commit/bf11c4b801b0dd23537d479c84876b7ce53456c9) patch - Add mirrors to download the agent from different online sources in case some sources are not available to the app network.
- [763c826](https://github.com/appsignal/appsignal-nodejs/commit/763c826c067ba4933d3eb645a77b3dfeb4a5e28a) patch - Support local installs when using `npm run install`. This will generate an install report for local installs in development.
- [ac90d69](https://github.com/appsignal/appsignal-nodejs/commit/ac90d697d40e6dd8eafe7ef1ea9d512fd3cdd7c0) patch - Bump agent to 7376537
  
  - Support JSON PostgreSQL operator in sql_lexer.
  - Do not strip comments from SQL queries.

## 2.0.0

- [f7acf83](https://github.com/appsignal/appsignal-nodejs/commit/f7acf8396d10af361fb1fd515942a8eae319af33) major - Drop support for Node.js 10 and 11. These are unmaintained versions of Node.js.
- [9b4c67c](https://github.com/appsignal/appsignal-nodejs/commit/9b4c67c7c95060c064396611bdd81f339b999d7b) patch - Bump agent to v-0318770.
  
  - Improve Dokku platform detection. Do not disable host metrics on
    Dokku.
  - Report CPU steal metric.

## 1.2.9

- [7d55636](https://github.com/appsignal/appsignal-nodejs/commit/7d55636f74d5280317df7719ddd3933bbebb5e6e) patch - Bump agent to 0f40689
  
  - Add Apple Darwin ARM alias.
  - Improve appsignal.h documentation.
  - Improve transaction debug log for errors.
  - Fix agent zombie/defunct issue on containers without process reaping.

## 1.2.8

- [fc98c22](https://github.com/appsignal/appsignal-nodejs/commit/fc98c22ded10b836ed527fbd57bf3046107e0578) patch - Bump agent to v-891c6b0. Add experimental Apple Silicon M1 ARM64 build.

## 1.2.7

- [1b54698](https://github.com/appsignal/appsignal-nodejs/commit/1b54698178414559878ea1bba51408eac03600e3) patch - Fix installation report result. The installation report would report always "unknown" previously, now it will accurately report success and failure results. This will help the AppSignal team debug issues when the report is sent along with the diagnose report.
- [24693ed](https://github.com/appsignal/appsignal-nodejs/commit/24693ed75a2a6a4895764386c9af9de3a1189290) patch - Bump agent to c2024bf with appsignal-agent diagnose timing issue fix when reading the report and improved filtering for HTTP request transmission logs.
- [ffaaa92](https://github.com/appsignal/appsignal-nodejs/commit/ffaaa9259af0e7881aca505f7e70cf1a14d00b12) patch - Bump agent to version that is compatible with different error grouping types.

## 1.2.6

- [8a26df7](https://github.com/appsignal/appsignal-nodejs/commit/8a26df7974dbb2751acf561890118e4fb6d1812e) patch - Add Linux ARM 64-bit experimental build, available behind a feature flag. To test this set the `APPSIGNAL_BUILD_FOR_LINUX_ARM` flag before compiling your apps: `export APPSIGNAL_BUILD_FOR_LINUX_ARM=1 <command>`. Please be aware this is an experimental build. Please report any issue you may encounter at our [support email](mailto:support@appsignal.com).

## 1.2.5

- [a55fd1f](https://github.com/appsignal/appsignal-nodejs/commit/a55fd1f0d7aedc1d06024031db80ee4543b332bf) patch - Package release.

## 1.2.5-alpha.1

- [a6a6393](https://github.com/appsignal/appsignal-nodejs/commit/a6a6393ca3d6e2d6cfb82e46615d78c47a7c6fde) patch - Update `APPSIGNAL_BUILD_FOR_MUSL` build flag to also listen to the value `1`,
  as is documented. Usage: `APPSIGNAL_BUILD_FOR_MUSL=1` and then run the
  `npm/yarn install` command.

# AppSignal for Node.js Changelog

## 2.2.8

### Added

- [e96af09](https://github.com/appsignal/appsignal-nodejs/commit/e96af09918124c34e19e0287a096ec5e2cf838a9) patch - The `caFilePath` config option now works for diagnose script external requests.
- [0eb2eed](https://github.com/appsignal/appsignal-nodejs/commit/0eb2eed2c319d629aad3715300fbd745e681bfc2) patch - Add helper to access the globally stored AppSignal client.
- [118ae05](https://github.com/appsignal/appsignal-nodejs/commit/118ae0505db1b411cf0dbc0688b60c6a138109ef) patch - The `sendParams` config option is now available. When set to `false`, it prevents the integration
  from sending request params to AppSignal.
- [e5f4a97](https://github.com/appsignal/appsignal-nodejs/commit/e5f4a9744a315881a453ba06135e11f3d2a683c8) patch - Handle request errors in the internal HTTP transmitter used by diagnose tool
  and Push API key validator.

### Changed

- [7882541](https://github.com/appsignal/appsignal-nodejs/commit/7882541f8e4c03bdf36a728d50dda07568a73815) patch - The extension is now responsible of determining if the process is running in a container. This check
  was previously made by the Node.js integration code.
- patch - Update @appsignal/nodejs-ext dependency to 2.0.6.

## 2.2.7

### Fixed

- [d175bc1](https://github.com/appsignal/appsignal-nodejs/commit/d175bc1cafb3a6cfd9cea2ad145dd8201c2e3add) patch - Fix debug and transaction_debug_mode log options. If set, previously the log_level would remain "info", since version 2.2.6.

## 2.2.6

### Added

- [a2ee3d5](https://github.com/appsignal/appsignal-nodejs/commit/a2ee3d5919f46b51883546e32ac5d5c0f673993e) patch - Add `send_environment_metadata` config option to configure the environment metadata collection. For more information, see our [environment metadata docs](https://docs.appsignal.com/application/environment-metadata.html).
- [158a134](https://github.com/appsignal/appsignal-nodejs/commit/158a134eca12596bc36b3a0fc61b56064da79d8d) patch - Add "logLevel" config option. This new option allows you to select the type of messages
  AppSignal's logger will log and up. The "debug" option will log all "debug", "info", "warning"
  and "error" log messages. The default value is: "info"
  
  The allowed values are:
  - error
  - warning
  - info
  - debug

### Changed

- patch - Update @appsignal/nodejs-ext dependency to 2.0.5.

### Deprecated

- [158a134](https://github.com/appsignal/appsignal-nodejs/commit/158a134eca12596bc36b3a0fc61b56064da79d8d) patch - Deprecate "debug" and "transactionDebugMode" config options in favor of the new "logLevel"
  config option.

## 2.2.5

- [c750216](https://github.com/appsignal/appsignal-nodejs/commit/c750216b4c0ce4e40f97513787516532a35b35de) patch - Send the diagnose report with correct query parameters to help link the report to the app and organization on AppSignal.com.
- [2ceda25](https://github.com/appsignal/appsignal-nodejs/commit/2ceda25637935753fe0404d79ef7bf79d65e556d) patch - The AppSignal config is not considered valid anymore when the apiKey config option is not set.
- [4711784](https://github.com/appsignal/appsignal-nodejs/commit/4711784dc3f1acf361728d1849a3acff25ae6c23) patch - Print the extension installation dependencies and flags in the diagnose report output.
- [5ab6e0a](https://github.com/appsignal/appsignal-nodejs/commit/5ab6e0a65248d1848a1ed1416a42069358dc9216) patch - Add information about the sources of each configuration value in the output of the diagnose report.
- [3a3dca3](https://github.com/appsignal/appsignal-nodejs/commit/3a3dca3550835dafa7922babef45bb2712b34cce) patch - Include the sources of each configuration value in the diagnose report that is sent to AppSignal.com.
- [4308789](https://github.com/appsignal/appsignal-nodejs/commit/43087898d17b647467c7166e2909f782728626ee) patch - Standardize diagnose validation failure message. Explain the diagnose request failed and why.
- [dc6cc13](https://github.com/appsignal/appsignal-nodejs/commit/dc6cc1371e85b8e5846839f50aeb382f7f4e0ae7) patch - Diagnose report config opts are now printed in camel case format,
  matching how the configuration options are provided to the `Appsignal` object
- [c1dae16](https://github.com/appsignal/appsignal-nodejs/commit/c1dae1623cb2a31940f1b845c420a4f9fea071ff) patch - Print deprecation message when passing a filename to `logPath` config option.
  This was already deprecated. Now it also prints a warning message on app start.
- [d72d600](https://github.com/appsignal/appsignal-nodejs/commit/d72d600f1d91ed7894fb014f899d90a38a033712) patch - The AppSignal client is stored on the global object as to make
  access easier for AppSignal developers.
- [bf69146](https://github.com/appsignal/appsignal-nodejs/commit/bf69146e25b06d70e3d7c07450f35f2016801114) patch - Fix TypeScript compatibility for global object augmentation.
- [df4163f](https://github.com/appsignal/appsignal-nodejs/commit/df4163fc10e972934ff62fe7a1ac6cbcd0416335) patch - Add `filterParameters` and `filterSessionData` options to filter out specific parameter keys or session data keys. Previously only the (undocumented) `filterDataKeys` config option was available to filter out all kinds of sample data.
- [13068b7](https://github.com/appsignal/appsignal-nodejs/commit/13068b7169cfc4dc285ac91757a1e121a75e0c95) patch - Rename the `apiKey` option to `pushApiKey` to match other AppSignal integrations. If `apiKey` is set it will automatically set `pushApiKey`. The `apiKey` option will be removed in the next major version of this package.
- [2c008ae](https://github.com/appsignal/appsignal-nodejs/commit/2c008ae269930fb4a223f4b528a89ccfd2aef95d) patch - Default log output to app STDOUT on Heroku dyno's. This makes the AppSignal logs available in the Heroku app's logs.
- [4c11f36](https://github.com/appsignal/appsignal-nodejs/commit/4c11f36b292e090fd1dc2aa2ff7001b371bdb8cf) patch - The `requestHeaders` config option is now available. An allow list that gives the ability to define
  which request headers you want to be shown in sample detail views. The default is a list of common
  headers that do not include [personal identifiable information](https://docs.appsignal.com/appsignal/gdpr.html#allowed-request-headers-only).
  Read more about [request headers](https://docs.appsignal.com/application/header-filtering.html) on our documentation website.
- [2358c9f](https://github.com/appsignal/appsignal-nodejs/commit/2358c9f20bb203af83d7961e37a11ce65c9f1be4) patch - Fix the diagnose's `log_dir_path` path check. It now always checks the actual log file's parent directory, rather than the configured path. These two values may differ as the package does a permission check to see if the `logPath` is writable or not.
- [3d6d23b](https://github.com/appsignal/appsignal-nodejs/commit/3d6d23bead6fd172845be2f7340a54ed5aa28542) patch - Fix writable check for paths in the diagnose report. Previously it only checked if a path was readable, not writable.
- [a64b36f](https://github.com/appsignal/appsignal-nodejs/commit/a64b36fa181b7ac06ff5f922ebe1dbd9b2d22937) patch - Check if the fallback log directory can be written to and print a warning if no log can be written there.
- [593d568](https://github.com/appsignal/appsignal-nodejs/commit/593d568e37180a75ac33d3e97fc02633d0c8faa5) patch - The logPath config option only allows writable paths. If the provided path is not writable,
  it'll automatically change to the Operating System's temporary directory (`/tmp`).
- patch - Update @appsignal/nodejs-ext dependency to 2.0.4.

## 2.2.4

- [ec93e49](https://github.com/appsignal/appsignal-nodejs/commit/ec93e49a29c56b7b0d5f66a9d069cc8e82cdf76a) patch - All user-configurable options are now printed in the diagnose report.
  
  Check the [list of available options](https://docs.appsignal.com/nodejs/configuration/options.html).

## 2.2.3

- [1d3eccc](https://github.com/appsignal/appsignal-nodejs/commit/1d3eccc86c05add0ef5d80d47228ab84d42edd89) patch - Fix diagnose report recognition when sent to the server. It was sent without an `api_key` parameter, which resulted in apps not being linked to the parent organization based on the known Push API key.
- [9171182](https://github.com/appsignal/appsignal-nodejs/commit/9171182ac1d5c907df631ac5d00d729348527bb5) patch - Transmit the path file modes in the diagnose report as an octal number. Previously it send values like `33188` and now it transmits `100644`, which is a bit more human readable.
- patch - Update @appsignal/nodejs-ext dependency to 2.0.3.

## 2.2.2

- [fbea22c](https://github.com/appsignal/appsignal-nodejs/commit/fbea22cd6f3a1e9d4c6e1b29446ee772025b6a0c) patch - Fix sending the agent diagnose report with all reports. It was sent, but with the wrong key, which made our server side validator report it as missing.
- [619b02a](https://github.com/appsignal/appsignal-nodejs/commit/619b02a30b453b1cf44ad228a1e59233c06602dc) patch - Print agent diagnose report in diagnose CLI output.
- [1e35cf8](https://github.com/appsignal/appsignal-nodejs/commit/1e35cf8d814e0087b2e10dfcb463831c6d34b18e) patch - Add new config option to enable/disable StatsD server in the AppSignal agent. This new config option is called `enableStatsd` and is set to `false` by default. If set to `true`, the AppSignal agent will start a StatsD server on port 8125 on the host.

## 2.2.1

- [98f11a0](https://github.com/appsignal/appsignal-nodejs/commit/98f11a0685f05676669ded7fa852536c59991e80) patch - The diagnose report will report parsing errors on reading or parsing the installation report. Previously, a missing installation report file would crash the diagnose tool.
- [e4215a1](https://github.com/appsignal/appsignal-nodejs/commit/e4215a119849a709fc44f8b5d1d2b96ea0e1a269) patch - Print String values in the diagnose report surrounded by quotes. Makes it more clear that it's a String value and not a label we print.
- [d0a05ae](https://github.com/appsignal/appsignal-nodejs/commit/d0a05ae9bcaeef6d4443e53952920774821aeb5c) patch - Correct the diagnose host section indenting, it was indented one level too far to the right when printed.

## 2.2.0

- [9c8319e](https://github.com/appsignal/appsignal-nodejs/commit/9c8319e7d014882b9d4fe609ac49e3918f4e0259) minor - Remove interface usage from @appsignal/types
  
  All Node.js-specific interfaces from the types package are now defined
  inside the nodejs core package. There's still a dependency from types
  package for common types as Func, HashMap, and HasMapValue.
  
  With this change, we keep taking advantage of interfaces, but now they're
  defined in a place where they're used.

## 2.1.1

- [42edcc0](https://github.com/appsignal/appsignal-nodejs/commit/42edcc06b9258cc30ea13008d1f7ebc39332e28d) patch - Show correct language version in diagnose's extension installation section. It did not show the language version used during install, but the current one used to run the diagnose tool.
- [99b2f6c](https://github.com/appsignal/appsignal-nodejs/commit/99b2f6cd6ca743d42c59587a05e979efe080797a) patch - Rename the `Agent` module to `Extension` to fit better with our naming standards.
- [ad6be4f](https://github.com/appsignal/appsignal-nodejs/commit/ad6be4f38a6caff7fdfa06ae1d1ef51145bc004d) patch - Fix diagnose installation status reporting. It previously always reported "success", but will now also print failures.
- patch - Update @appsignal/nodejs-ext dependency to 2.0.2.

## 2.1.0

- [723b98d](https://github.com/appsignal/appsignal-nodejs/commit/723b98d1370cb74d3d0198f4c7d49d08691095c2) minor - Add rootSpan and setError helpers.
  
  Errors added to child spans are ignored by the agent. Now the rootSpan is
  always accessible from the tracer object as well as setError. The setError
  function allows to track errors on demand and they will be always attached
  to the main current span, so they don't get ignored by the agent.
- [f0256d3](https://github.com/appsignal/appsignal-nodejs/commit/f0256d3979fef129ded0644e712efbb96036967a) patch - Bug fix in custom timestamp calculation
- [1f182a4](https://github.com/appsignal/appsignal-nodejs/commit/1f182a49548322b8af8ecec59ca5efe85cbebc29) patch - Deprecate the addError function on the Span interface. Instead use the Tracer's `setError` function to set the error on the root span.
- [96df8a4](https://github.com/appsignal/appsignal-nodejs/commit/96df8a43d7e9061233ac9ff9e5f2dde3c8d83ff7) patch - Add sendError helper to Tracer object.
  
  This new helper allows you to track an error separately from any other span
  inside the current context. Or use it to set up in your own error handling to
  report errors in a catch-statement if no performance monitoring is needed.
  
  ```js
  try {
    // Do complex stuff
  } catch (error) {
    appsignal.tracer().sendError(error, span => {
      span.setName("daily.task"); // Set a recognizable action name
      span.set("user_id", user_id); // Set custom tags
    });
  }
  ```
- patch - Update @appsignal/nodejs-ext dependency to 2.0.1.

## 2.0.0

- [f7acf83](https://github.com/appsignal/appsignal-nodejs/commit/f7acf8396d10af361fb1fd515942a8eae319af33) major - Drop support for Node.js 10 and 11. These are unmaintained versions of Node.js.
- patch - Update @appsignal/nodejs-ext dependency to 2.0.0.

## 1.3.2

- patch - Update @appsignal/nodejs-ext dependency to 1.2.9.

## 1.3.1

- patch - Update @appsignal/nodejs-ext dependency to 1.2.8.

## 1.3.0

- [87155be](https://github.com/appsignal/appsignal-nodejs/commit/87155bec7166aec036f1f861d57c17d102261ebb) minor - Format and print the diagnose report in a human-readable format.
- [a3bbb9f](https://github.com/appsignal/appsignal-nodejs/commit/a3bbb9f3664749a174abbecf92554d73d04dd707) patch - Fix the log path reported when running the diagnose command to include the
  filename.
- [baa2b7f](https://github.com/appsignal/appsignal-nodejs/commit/baa2b7fb46aaa42a0e7d953276df3965968f733f) patch - Limit the `appsignal.log` file size in diagnose report. It will only send the last 2MiB of the file. This prevents the diagnose report from sending too much data that it gets rejected by the server.
- [7bb5398](https://github.com/appsignal/appsignal-nodejs/commit/7bb5398af34a46038b52fede68c5746df9db71e0) patch - Fix the validation of Push API key in the diagnose report. It would always print "valid" even if the key was not set or invalid.
- patch - Update @appsignal/nodejs-ext dependency to 1.2.7.

## 1.2.6

- patch - Update @appsignal/nodejs-ext dependency to 1.2.6.

## 1.2.5

- [a55fd1f](https://github.com/appsignal/appsignal-nodejs/commit/a55fd1f0d7aedc1d06024031db80ee4543b332bf) patch - Package release.
- [a55fd1f](https://github.com/appsignal/appsignal-nodejs/commit/a55fd1f0d7aedc1d06024031db80ee4543b332bf) patch - Update @appsignal/nodejs-ext dependency to 1.2.5

## 1.2.5-alpha.2

- [f4591b0](https://github.com/appsignal/appsignal-nodejs/commit/f4591b019654342c46f3d88ec5dbb8da55f9fbac) patch - Fix nodejs package dependency version lock. Due to a mono bug the `nodejs-ext` package was locked to version `1.2.5`, which isn't out yet, instead of `1.2.5-alpha.1`.

## 1.2.5-alpha.1

- [58e73ba](https://github.com/appsignal/appsignal-nodejs/commit/58e73ba815d31dbf5f25e74d50eb843b112fc3de) patch - Replace the `--no-report` option--which turned sending the diagnose report
  to AppSignal's servers off--with `--send-report` and `--no-send-report`.
  
  By default, the report is not sent if you don't pass `--send-report`.
- [08d5646](https://github.com/appsignal/appsignal-nodejs/commit/08d5646bc88a0049edfeb4475bc4e0a03ec08b04) patch - Update @appsignal/nodejs-ext dependency to 1.2.5

## 1.2.4
- Wrap filepath in quotes in tar command. PR #387

## 1.2.3
- Handle all non-dynamic paths as static routes in Next.js. PR #383
- Another fix for dynamic routes in Next PR #380
- Fixes for data handling PR #385 

## 1.2.2
- Report the install status as unknown in diagnose PR #373
- Fix musl target and override reporting. PR #374
- Bump agent to d08ae6c. PR #378. Fix span API related issues with empty events
  for error samples and missing incidents.

## 1.2.1
- Make log path config consistent with other integrations (#364)
- Don't break diagnose when agent isn't loaded (#365)

## 1.2.0
- Add minutely probe for collecting heap stats (#345)
- Bumped agent to 44e4d97
- Dependency bumps

## 1.1.0
- Fix memory leak when creating child spans by passing around span reference instead of id strings (#351)
- Pass options to child span via `span.child()` helper by adding optional `options` argument
- Bumped agent to 1332013
- Dependency bumps

## 1.0.5
- Allow spans to be created with a startTime (#340)
- Dependency bumps

## 1.0.4
- Bumped agent to c55fb2c
- Dependency bumps

## 1.0.3
- Bumped agent to 361340a
- Add `engine-strict=true` config to prevent installs on old Node (#328)
- Dependency bumps

## 1.0.2
- Bumped agent to dc62118
- Fixes for Next.js routes not ignored by HTTP integration (#326)
- Diagnose fixes (#322)
- Move nodejs integration types to @appsignal/types (#306)
- Use es2018 as tsc target per Node Target Mapping docs

## 1.0.1
- Bumped agent to 5b16a75
- Fixed a version mismatch issue in the agent which caused no samples to be processed

## 1.0.0
- Inital release 🎉

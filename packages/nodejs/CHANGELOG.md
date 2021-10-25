# AppSignal for Node.js Changelog

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

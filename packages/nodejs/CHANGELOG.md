# AppSignal for Node.js Changelog

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

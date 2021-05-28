# AppSignal for Node.js Changelog

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

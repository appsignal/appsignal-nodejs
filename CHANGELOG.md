# AppSignal for Node.js Changelog

## 3.0.28

### Fixed

- [72e9e73](https://github.com/appsignal/appsignal-nodejs/commit/72e9e731b3a28155fe7c77d67ae619f649bfeec1) patch - Update the diagnose tool URLs printed by the CLI and package to the new location in our documentation.
- [96b8545](https://github.com/appsignal/appsignal-nodejs/commit/96b8545323195ee5857a18190c5138834e51756f) patch - Fix compatibility issue with Node.js's node-gyp package and Python 3.12.0. Python 3.12.0 removed a package called "distutils", causing the extension to fail to install. Upgrade the node-gyp package with the fix for this issue.

## 3.0.27

### Changed

- [5c460cc](https://github.com/appsignal/appsignal-nodejs/commit/5c460ccda90e128a8560c53f0094684fd31c00d6) patch - Remove `route` tag from HTTP server spans. Since the span will already have the route attribute as part of its name, the tag is redundant.
- [5c460cc](https://github.com/appsignal/appsignal-nodejs/commit/5c460ccda90e128a8560c53f0094684fd31c00d6) patch - Filter more disk mountpoints for disk usage and disk IO stats. This helps reduce noise in the host metrics by focussing on more important mountpoints.
  
  The following mountpoint are ignored. Any mountpoint containing:
  
  - `/etc/hostname`
  - `/etc/hosts`
  - `/etc/resolv.conf`
  - `/snap/`
  - `/proc/`

### Fixed

- [5c460cc](https://github.com/appsignal/appsignal-nodejs/commit/5c460ccda90e128a8560c53f0094684fd31c00d6) patch - Fix an issue where the `method` tag extracted from an incoming HTTP request span would be overriden with the method used for an outgoing HTTP request span.
- [5c460cc](https://github.com/appsignal/appsignal-nodejs/commit/5c460ccda90e128a8560c53f0094684fd31c00d6) patch - - Support disk usage reporting (using `df`) on Alpine Linux. This host metric would report an error on Alpine Linux.
  - When a disk mountpoint has no inodes usage percentage, skip the mountpoint, and report the inodes information successfully for the inodes that do have an inodes usage percentage.
- [7ec2008](https://github.com/appsignal/appsignal-nodejs/commit/7ec20087293a6809f54b01097b87624d6c72042e) patch - Fix missing error metrics for the error rate and error count graphs in some scenarios, like with Koa apps.

## 3.0.26

### Changed

- [89db29f](https://github.com/appsignal/appsignal-nodejs/commit/89db29fe35731d4b014f8efbf4a8151530132853) patch - Bump agent to eec7f7b
  
  Updated the probes dependency to 0.5.2. CPU usage is now normalized to the number of CPUs available to the container. This means that a container with 2 CPUs will have its CPU usage reported as 50% when using 1 CPU instead of 100%. This is a breaking change for anyone using the cpu probe.
  
  If you have CPU triggers set up based on the old behaviour, you might need to update those to these new normalized values to get the same behaviour. Note that this is needed only if the AppSignal integration package you're using includes this change.

## 3.0.25

### Added

- [ab7f3c7](https://github.com/appsignal/appsignal-nodejs/commit/ab7f3c73308b77a9573bb7fb74e18a34fa95be35) patch - Add `initializeOpentelemetrySdk` configuration option. This allows those who
  would rather take control of how OpenTelemetry is initialised in their
  application to skip AppSignal's initialization of the OpenTelemetry SDK.
  
  Additionally, add an `opentelemetryInstrumentations` method on the client,
  which returns AppSignal's default OpenTelemetry instrumentations, already
  configured to work correctly with AppSignal. The provided list of
  instrumentations will follow the `additionalInstrumentations` and
  `disableDefaultInstrumentations` config options, if those are set.
  
  This is not the recommended way to use AppSignal for Node.js. Only use this
  config option and this method if you're really sure that you know what
  you're doing.
  
  When initialising OpenTelemetry, it is necessary to add the AppSignal span
  processor in order for data to be sent to AppSignal. For example, using the
  OpenTelemetry SDK:
  
  ```js
  import { SpanProcessor, Appsignal } from "@appsignal/nodejs";
  // or: const { SpanProcessor, Appsignal } = require("@appsignal/nodejs")
  
  const sdk = new NodeSDK({
    spanProcessor: new SpanProcessor(Appsignal.client)
    instrumentations: Appsignal.client.opentelemetryInstrumentations()
  });
  
  sdk.start()
  ```
  
  The above snippet assumes that the AppSignal client has been initialised
  beforehand.
  
  When making use of this config option, the OpenTelemetry instrumentations
  must be configured in the same way as it is done in the AppSignal integration.
  In the above snippet, the `instrumentations` property in the OpenTelemetry SDK
  is set to the AppSignal client's list of OpenTelemetry instrumentations, which
  are configured to work correctly with AppSignal.
- [daa8982](https://github.com/appsignal/appsignal-nodejs/commit/daa898225e0594b9b4831da08c84f139cf842166) patch - Add the `setSqlBody` tracing helper to set the body attribute on a span that contains a SQL query. When using this helper the given SQL query will be sanitized, reducing the chances of sending sensitive data to AppSignal.
  
  ```js
  import { setSqlBody } from "@appsignal/nodejs";
  
  // Must be used in an instrumented context -- e.g. an Express route
  setSqlBody("SELECT * FROM users WHERE 'password' = 'secret'");
  // Will be stored as: "SELECT * FROM users WHERE 'password' = ?"
  ```
  
  When the `setBody` helper is also used, the `setSqlBody` overwrites the `setBody` attribute.
  
  More information about our [tracing helpers](https://docs.appsignal.com/nodejs/3.x/instrumentation/instrumentation.html) can be found in our documentation.

### Changed

- [33bce2e](https://github.com/appsignal/appsignal-nodejs/commit/33bce2e837505b8beaa140c578816aa7007c3569) patch - Bump agent to b604345.
  
  - Add an exponential backoff to the retry sleep time to bind to the StatsD, NGINX and OpenTelemetry exporter ports. This gives the agent a longer time to connect to the ports if they become available within a 4 minute window.
  - Changes to the agent logger:
    - Logs from the agent and extension now use a more consistent format in logs for spans and transactions.
    - Logs that are for more internal use are moved to the trace log level and logs that are useful for debugging most support issues are moved to the debug log level. It should not be necessary to use log level 'trace' as often anymore. The 'debug' log level should be enough.
  - Add `running_in_container` to agent diagnose report, to be used primarily by the Python package as a way to detect if an app's host is a container or not.
  
  Bump agent to 8260fa1.
  
  - Add `appsignal.sql_body` magic span attribute for OpenTelemetry spans. When this attribute is detected, we store the value as the span/event body. This span is sanitized beforehand so it doesn't contain any sensitive data and helps to group events in our backend. When used in combination with the `appsignal.body` attribute, the new `appsignal.sql_body` attribute is leading.
  
  More information on [AppSignal OpenTelemetry span attributes](https://docs.appsignal.com/opentelemetry/custom-instrumentation/attributes.html) can be found in our docs.
- [285f89e](https://github.com/appsignal/appsignal-nodejs/commit/285f89e732a552a5ec8f2ca627d492b7d0d2ea19) patch - Print more path details in the diagnose CLI output. It will now print details like if a path exists, the ownership of a path and if it's writable or not to help debug issues locally.
- [3204cdd](https://github.com/appsignal/appsignal-nodejs/commit/3204cdd597cc342343aae434ca0de277418e08e2) patch - Bump agent to 1dd2a18.
  
  - When adding an SQL body attribute via the extension, instead of truncating the body first and sanitising it later, sanitise it first and truncate it later. This prevents an issue where queries containing very big values result in truncated sanitisations.

### Fixed

- [3367dfe](https://github.com/appsignal/appsignal-nodejs/commit/3367dfe583f4c2104f6f4b1e223eda88c58d88a1) patch - Fix a TypeScript types compatibility error upon app compilation when using the AppSignal Express error handler.

## 3.0.24

### Changed

- [2eb17b0](https://github.com/appsignal/appsignal-nodejs/commit/2eb17b0e3d8acfdf57bf2dda27a9b4b07db0a202) patch - Bump agent to e8207c1.
  
  - Add `memory_in_percentages` and `swap_in_percentages` host metrics that represents metrics in percentages.
  - Ignore `/snap/` disk mountpoints.
  - Fix issue with the open span count in logs being logged as a negative number.
  - Fix agent's TCP server getting stuck when two requests are made within the same fraction of a second.
- [037fcaa](https://github.com/appsignal/appsignal-nodejs/commit/037fcaaa9034668ce1610e72aaf27561e80b98d2) patch - Update Fastify dependency to make it compatible with Fastify 5

## 3.0.23

### Changed

- [aad5535](https://github.com/appsignal/appsignal-nodejs/commit/aad55357e0debddea62245f8f43c8fd210d6a26b) patch - Update OpenTelemetry dependencies to the latest versions.

## 3.0.22

### Changed

- [4d96c96](https://github.com/appsignal/appsignal-nodejs/commit/4d96c96f20cb059566fcbdb8c0b1925fe5f6952a) patch - Report express route parameters. If a route is defined like `/user/:id`, the `id` parameter will be reported from now on in the "Parameters" box on AppSignal.com.

## 3.0.21

### Changed

- [2c91c70](https://github.com/appsignal/appsignal-nodejs/commit/2c91c70d8df0ced2803dd9c880c21356109e112a) patch - Improve the behaviour of the GraphQL instrumentation, so that it creates less redundant spans for similar items in a list, and less trivial spans for attribute resolutions.

### Fixed

- [2c91c70](https://github.com/appsignal/appsignal-nodejs/commit/2c91c70d8df0ced2803dd9c880c21356109e112a) patch - Fix a misleading platform mismatch error when the AppSignal extension fails to load on musl-based systems.

## 3.0.20

### Fixed

- [eaaf01c](https://github.com/appsignal/appsignal-nodejs/commit/eaaf01c680ddaa044fbac4e44ffbd93049621967) patch - Bump agent to 6133900.
  
  - Fix `disk_inode_usage` metric name format to not be interpreted as a JSON object.

## 3.0.19

### Added

- [5cdf57b](https://github.com/appsignal/appsignal-nodejs/commit/5cdf57b700d0fe65d1997eb0eda26ba6f7cb1799) patch - Add the `hostRole` config option. This config option can be set per host to generate some metrics automatically per host and possibly do things like grouping in the future.

## 3.0.18

### Changed

- [7edc179](https://github.com/appsignal/appsignal-nodejs/commit/7edc1793f8d5751f5614f50dfa9891b9d5cd1b8a) patch - Bump agent to version d789895.
  
  - Increase short data truncation from 2000 to 10000 characters.
  - Include HTTP request method on Next.js samples as incident action name. Instead of `/path` it will now report `GET /path`.
  - Add a extractor for Remix js spans.

## 3.0.17

### Added

- [d5ec649](https://github.com/appsignal/appsignal-nodejs/commit/d5ec6499995ed861fa12a5174ef82801fdcd14d0) patch - Report total CPU usage host metric for VMs. This change adds another `state` tag value on the `cpu` metric called `total_usage`, which reports the VM's total CPU usage in percentages.
- [e37c108](https://github.com/appsignal/appsignal-nodejs/commit/e37c1088b7b7696ab871ce76b2d2bcd21634f92e) patch - Add the --config flag to diagnose command to specify a custom path for your AppSignal configuration file to
  be taken into account when running the diagnose of your AppSignal installation.

### Changed

- [702d4df](https://github.com/appsignal/appsignal-nodejs/commit/702d4dfafa566d3dec9ba04682eefcc88e3c252e) patch - Bump agent to 6bec691.
  
  - Upgrade `sql_lexer` to v0.9.5. It adds sanitization support for the `THEN` and `ELSE` logical operators.

## 3.0.16

### Added

- [8b9a84d](https://github.com/appsignal/appsignal-nodejs/commit/8b9a84d11a96f6631b732f7640a88eaeb03602d5) patch - Allow configuration of the agent's StatsD server port through the `statsdPort` option.
- [655d04f](https://github.com/appsignal/appsignal-nodejs/commit/655d04f1dc11fd18d1575ea22f399e8c192fe086) patch - Use `RENDER_GIT_COMMIT` environment variable as revision if no revision is specified.
- [7bfaa61](https://github.com/appsignal/appsignal-nodejs/commit/7bfaa61d0a2782e3ecd8ef070be3839e7de12b17) patch - Support Prisma 5
- [2dd8b61](https://github.com/appsignal/appsignal-nodejs/commit/2dd8b61dfa9f34d706ac61f96d71b8d1087442e6) patch - Allow configuration of the agent's TCP and UDP servers using the `bindAddress` config option. This is by default set to `127.0.0.1`, which only makes it accessible from the same host. If you want it to be accessible from other machines, use `0.0.0.0` or a specific IP address.

### Changed

- [6afc890](https://github.com/appsignal/appsignal-nodejs/commit/6afc8903f59159b0974d08b3192c3819d0984d4b) patch - Bump agent to fd8ee9e.
  
  - Rely on APPSIGNAL_RUNNING_IN_CONTAINER config option value before other environment factors to determine if the app is running in a container.
  - Fix container detection for hosts running Docker itself.
  - Add APPSIGNAL_STATSD_PORT config option.
- [c2f7b2b](https://github.com/appsignal/appsignal-nodejs/commit/c2f7b2ba9973e24544d9d589aa5cb4e32a781216) patch - Bump agent to 32590eb.
  
  - Only ignore disk metrics that start with "loop", not all mounted disks that end with a number to report metrics for more disks.

### Fixed

- [d1c9ab7](https://github.com/appsignal/appsignal-nodejs/commit/d1c9ab734676307e67f56fae75fb6447ce817a30) patch - Remove agent download file after extraction. This save a couple megabytes of space that are no longer needed when the agent and extension have been extracted from the downloaded `.tar.gz` file, reducing the overall app size.

## 3.0.15

### Added

- [71e076d](https://github.com/appsignal/appsignal-nodejs/commit/71e076dc704f6b8ad945d0af6eab9a881dd1e390) patch - The diagnose CLI command now reports on the presence of the `appsignal.cjs` file.
- [624b38b](https://github.com/appsignal/appsignal-nodejs/commit/624b38b158a778c328e8765c6495d118b1cac473) patch - Load the AppSignal app configuration file when running the diagnose to include the configuration in the diagnose report.

### Changed

- [c1cf2e1](https://github.com/appsignal/appsignal-nodejs/commit/c1cf2e17ebd503072314cc0120666f6affd33778) patch - Update bundled trusted root certificates.

### Deprecated

- [e2d5c20](https://github.com/appsignal/appsignal-nodejs/commit/e2d5c207a1b7296bc68d12298d6d0c1e44876ed7) patch - Add deprecation warning to instrumentationsLoaded helper

## 3.0.14

### Changed

- [c5dd902](https://github.com/appsignal/appsignal-nodejs/commit/c5dd902fe0e9d5402b7b356527b506fc111db819) patch - Update agent to version 6f29190.
  
  - Log revision config in boot debug log.
  - Update internal agent CLI start command.
  - Rename internal `_APPSIGNAL_ENVIRONMENT` variable to `_APPSIGNAL_APP_ENV` to be consistent with the public version.
  - Support Next.js instrumentation through the official Next.js package.

## 3.0.13

### Changed

- [3d8e2f2](https://github.com/appsignal/appsignal-nodejs/commit/3d8e2f21e7e1dcb1cf540b394271ab7f0b242058) patch - Update OpenTelemetry dependencies to the latest versions, providing many improvements and bug fixes.

## 3.0.12

### Fixed

- [403e772](https://github.com/appsignal/appsignal-nodejs/commit/403e772aecb5e08487eaa08c229f0ec55a000480) patch - Fix grouping for Prisma queries.

## 3.0.11

### Changed

- [108fa2e](https://github.com/appsignal/appsignal-nodejs/commit/108fa2e5320cecc70e7f66a8f5a36fa9da956f02) patch - Bump agent to 8d042e2.
  
  - Support multiple log formats.

## 3.0.10

### Added

- [266c53e](https://github.com/appsignal/appsignal-nodejs/commit/266c53eb0b5e7f1c3c7836771bb74b07c9f8abaf) patch - Support Winston child logger groups when using the Winston transport
  
  When using the Winston transport for our logging feature, the child loggers with an assigned group
  will send the group to AppSignal when logging messages.

## 3.0.9

### Changed

- [6dbe01f](https://github.com/appsignal/appsignal-nodejs/commit/6dbe01fcec65c10e8ec71445f7802399e1447ca6) patch - Bump agent to 0d593d5.
  
  - Report shared memory metric state.

## 3.0.8

### Added

- [914dd50](https://github.com/appsignal/appsignal-nodejs/commit/914dd504803b1841fbff3937663294f163b8ec06) patch - Add NGINX metrics support. See [our documentation](https://docs.appsignal.com/metrics/nginx.html) for details.

## 3.0.7

### Removed

- [e4ae654](https://github.com/appsignal/appsignal-nodejs/commit/e4ae654b2d4a37a1dbb8452b17731aa140421f50) patch - Remove fs instrumentation by default. It's causing issues on some installations. It can be manually added as [described in our fs module docs](https://docs.appsignal.com/nodejs/3.x/integrations/fsmodule.html).

## 3.0.6

### Changed

- [6e71a25](https://github.com/appsignal/appsignal-nodejs/commit/6e71a2589c7451a4554679992ffb3848e4f16193) patch - Bump agent to 050d7a5.
  
  - Fix distributed tracing for Node.js HTTP requests.
  - Create tags for specific HTTP attributes for all spans.

## 3.0.5

### Changed

- [fd76568](https://github.com/appsignal/appsignal-nodejs/commit/fd765684330984359682b199500f50987ca15438) patch - Bump agent to 041b9c4.
  
  - Detect Kubernetes containers better.
  - Add more trace logging for OpenTelemetry spans.
- [c03caf2](https://github.com/appsignal/appsignal-nodejs/commit/c03caf294356243135c968b329f1116ddc1f2d85) patch - Update prisma instrumentation package. Fixes installation deprecation warning.

## 3.0.4

### Added

- [0a14594](https://github.com/appsignal/appsignal-nodejs/commit/0a1459417b9b509ec8f946c7f876a2612e284946) patch - Add OpenTelemetry SDK initialization helper function
  
  The OpenTelemetry instrumentations are loaded async, this is OK when users rely on automatic instrumentations, but for custom instrumentations
  it might cause spans not to be reported. There's a new helper function that contains the instrumentations registration that can be awaited for resolution before running any custom instrumentations.

## 3.0.3

### Added

- [7b879f6](https://github.com/appsignal/appsignal-nodejs/commit/7b879f601472707fd7b9ae8083efc789c19d7212) patch - Track the Operating System release/distro in the diagnose report. This helps us with debugging what exact version of Linux an app is running on, for example.
- [e4d8609](https://github.com/appsignal/appsignal-nodejs/commit/e4d86090fcc4bd83ff887cb4487714b61928bb58) patch - Report request parameters for restify apps. This is reported automatically. You can disable parameter reporting with the AppSignal `sendParams: false` configuration option.
- [9bcd836](https://github.com/appsignal/appsignal-nodejs/commit/9bcd836e0ddf9bbce9b9bb8f51089847c93a4d2b) patch - Add Winston transport support for the logging feature.

### Changed

- [89f5cad](https://github.com/appsignal/appsignal-nodejs/commit/89f5cad971434b929e7887e8a00e79b20d66968e) patch - Log an error for appsignal.tracer function calls. Inform the user to update instrumentation code to be compatible with the latest version of our package.

### Fixed

- [7637610](https://github.com/appsignal/appsignal-nodejs/commit/76376105763299fd6f0f1df2789b57564fd39040) patch - Prevent creating fs-only samples by only creating an fs span if there is a parent span present.

## 3.0.2

### Added

- [8c1bd31](https://github.com/appsignal/appsignal-nodejs/commit/8c1bd31123feda7f2b415e49a3ec17db72c4b9d1) patch - Add support for the [restify package](https://www.npmjs.com/package/restify).

### Fixed

- [63df063](https://github.com/appsignal/appsignal-nodejs/commit/63df0637300442fae2f6baf41477d42dae228369) patch - Remove client IP from HTTP traces

## 3.0.1

### Added

- [0353a5f](https://github.com/appsignal/appsignal-nodejs/commit/0353a5f3e84ff87310b8356f681d2a9e1c6e8e04) patch - Support for Fastify request parameters. Request parameters (query, body) are now added to the HTTP spans when using Fastify.
- [c1354f0](https://github.com/appsignal/appsignal-nodejs/commit/c1354f0ff802eeb718b43ba08e1fc0f0f248049c) patch - Add Knex.js instrumentation. We will now auto instrument database queries made with Knex.js.
- [2e11cb2](https://github.com/appsignal/appsignal-nodejs/commit/2e11cb2bf44bd51447b0eba905cf26676471d894) patch - Support log collection from Node.js apps using the new AppSignal Logging feature. Learn more about [AppSignal's Logging on our docs](https://docs.appsignal.com/logging/platforms/integrations/nodejs.html).

## 3.0.0

Welcome to AppSignal for Node.js version 3.0.0.!

In this release, we have switched to using OpenTelemetry internally for tracing. (We do not yet support OpenTelemetry for metrics and logging, but do continue to support metrics through our own metrics system.) The AppSignal instrumentation packages `@appsignal/express`, `@appsignal/koa`, `@appsignal/nextjs` and `@appsignal/apollo-server` should no longer be used. Some official OpenTelemetry instrumentation packages are bundled with our package as dependencies and instrumented automatically. Other _supported instrumentation packages_ can be [added and configured manually](https://docs.appsignal.com/nodejs/3.x/instrumentation/additional-instrumentations.html).

We strongly recommend following the [migration guide] while upgrading. Instrumentation from package version 2 is not compatible with version 3. Custom instrumentation will need to be set up using [OpenTelemetry instrumentation](https://docs.appsignal.com/nodejs/3.x/instrumentation/instrumentation.html).

If you run into any issues upgrading to this new version, please contact us at [support@appsignal.com][support] for help.

- [Version 3 migration guide][migration guide]
- [Contact us for support][support]

[migration guide]: https://docs.appsignal.com/nodejs/3.x/migration-guide.html
[support]: mailto:support@appsignal.com

### Added

- Add support for express package
- Add support for graphql package
- Add support for ioredis package
- Add support for Fastify
- Add support for Knex.js
- Add support for koa package
- Add support for mysql package
- Add support for mysql2 package
- Add support for MongoDB
- Add support for Mongoose
- Add support for Nest.js
- Add support for Next.js
- Add support for pg package
- Add support for prisma package
- Add support for redis package
- Add support for redis package version 4
- Add support for the fs module
- Instrument outgoing HTTP requests

### Changed

- Use OpenTelemetry for tracing instrumentation of libraries and Node.js modules.
- Remove dependency on `@appsignal/*` instrumentation packages.

## 3.0.0-beta.7

### Added

- [e01b1d3](https://github.com/appsignal/appsignal-nodejs/commit/e01b1d3559c6080de971a8ff347c5e526b1a272e) patch - Add MongoDB instrumentation
- [b21d2cc](https://github.com/appsignal/appsignal-nodejs/commit/b21d2cc5fc53a03980d0a813b82785bcd756d218) patch - Instrument outgoing HTTP requests

## 3.0.0-beta.6

### Changed

- [fcdaac2](https://github.com/appsignal/appsignal-nodejs/commit/fcdaac223b073974e3476551c0d592393363b188) patch - Bump agent version to support fs instrumentation

## 3.0.0-beta.5

### Added

- [cee020f](https://github.com/appsignal/appsignal-nodejs/commit/cee020ffbc3850b6564f1d8e5312b6418f8dd15f) patch - Add fs module support

### Fixed

- [ec9aa36](https://github.com/appsignal/appsignal-nodejs/commit/ec9aa36a390545a56b1b8e4a1c63a0b7c4fe1a5a) patch - Only set the params on Koa router layer, instead of on all layers.

## 3.0.0-beta.4

### Added

- [470c129](https://github.com/appsignal/appsignal-nodejs/commit/470c129d80d8b4118329f29f5e75022839343d9f) patch - Add Fastify support
- [bcf182b](https://github.com/appsignal/appsignal-nodejs/commit/bcf182b987d039621899411190c285944c0af3f1) patch - Add OpenTelemetry SpanKind as a magic attribute
- [daeeaac](https://github.com/appsignal/appsignal-nodejs/commit/daeeaac685b14f1ee9a2b6ee2bc25436004d6903) patch - Add Mongoose support

## 3.0.0-beta.3

### Added

- [c07b3a4](https://github.com/appsignal/appsignal-nodejs/commit/c07b3a41b9354e18d125ab9f5ddf48bb51ce6368) patch - Add support for Nest.js
- [8128eb9](https://github.com/appsignal/appsignal-nodejs/commit/8128eb9db1634f0ca7c8d35c302c924719d09f20) patch - Update the AppSignal agent version to add Nest.js support.

### Fixed

- [8128eb9](https://github.com/appsignal/appsignal-nodejs/commit/8128eb9db1634f0ca7c8d35c302c924719d09f20) patch - Update the AppSignal agent version to fix an issue with the HTTP proxy where the proxy port would always be set to 8080.

## 3.0.0-beta.2

### Changed

- [23192ef](https://github.com/appsignal/appsignal-nodejs/commit/23192ef792ae795e24dd174443c232c676edfd08) patch - Bump agent to v-de2dd6e.
  
  - Remove fallback for unknown span body. The notice about a missing extractor
    is now a trace level log.
  - Filter root span attributes that are set as tags, params, headers, etc.
  - Filter more root span attributes that can contain PII information.
  - Improve http extractor span name to use `http.route` attribute to always
    build the incident action name. This should avoid new incidents with 
    `HTTP POST`-like naming.

## 3.0.0-beta.1

### Added

- [ded7a82](https://github.com/appsignal/appsignal-nodejs/commit/ded7a821332efd3e97a0867adcdd60f58fdd30a2) major - Add OpenTelemetry support to the AppSignal Node.js integration. This new major release uses OpenTelemetry to support tracing instrumentation. The old `@appsignal/<package name>` instrumentation packages are not compatible. Please remove them before upgrading.

### Changed

- [d452b46](https://github.com/appsignal/appsignal-nodejs/commit/d452b4670b03eb8d9101684eb7188eb091fb37ea) patch - Support OpenTelemetry root spans in SpanProcessor. This change makes AppSignal instrumentation (like Express/Koa.js/Next.js) no longer a requirement. In fact you will need to use the OpenTelemetry instrumentation for those libraries from now on.
- [60428c8](https://github.com/appsignal/appsignal-nodejs/commit/60428c8932602649fbaf54e5d9c19caa773f07c1) patch - Bump agent to v-d573c9b
  
  - Display unsupported OpenTelemetry spans in limited form.
  - Clean up payload storage before sending. Should fix issues with locally queued payloads blocking data from being sent.
  - Add `appsignal_create_opentelemetry_span` function to create spans for further modification, rather than only import them.
- [a1d947c](https://github.com/appsignal/appsignal-nodejs/commit/a1d947c9d25055d9198600c54b1bceb28b322ad8) patch - Remove the mysql2 package peer dependency. It's not only present as a development dependency for the package.
- [54491fa](https://github.com/appsignal/appsignal-nodejs/commit/54491fa04c75e536fc2010b3df1c1f33037af4d2) patch - Bump agent to 06391fb
  
  - Accept "warning" value for the `log_level` config option.
  - Add aarch64 Linux musl build. Doesn't work for Node.js package.
  - Improve debug logging from the extension.
  - Fix high CPU issue for appsignal-agent when nothing could be read from the socket.

### Removed

- [2b95a68](https://github.com/appsignal/appsignal-nodejs/commit/2b95a6883c0da65f865b17be4e73856845d51d64) major - Remove `debug` config option. This has been replaced with `logLevel` set to `debug`.
- [13bc306](https://github.com/appsignal/appsignal-nodejs/commit/13bc306bd02d9b2f1fb124239444f7611c68d379) major - Remove the `apiKey` config option. This has been renamed to `pushApiKey`.

### Fixed

- [d452b46](https://github.com/appsignal/appsignal-nodejs/commit/d452b4670b03eb8d9101684eb7188eb091fb37ea) patch - Improve the error message on extension load failure. The error message will now print more details about the installed and expected architecture when they mismatch. This is most common on apps mounted on a container after first being installed on the host with a different architecture than the container.
- [fa13d19](https://github.com/appsignal/appsignal-nodejs/commit/fa13d198ed42eb23674732f4e17ba4b4595cea39) patch - Accept uppercase input in diagnose tool send report prompt. When prompted to send the report when the diagnose tool, it will now also accept uppercase values like "Y" and "N".

## 2.4.2

### Changed

- [b7382d7](https://github.com/appsignal/appsignal-nodejs/commit/b7382d7ee40729a0e9eea32e59daed4e69f688bf) patch - Do not restore closed spans from within the `withSpan` helper. If a previously active span gets closed while `withSpan` has another span as currently active, do not restore the closed span when the callback has finished.
- [7a7bc9b](https://github.com/appsignal/appsignal-nodejs/commit/7a7bc9b62d5c9f021cfe337b520eac875a5b4c5f) patch - Do not restore root span after `withSpan` callback has finished. Previously the root span was restored to the original root span before the `withSpan` helper was called. This has been changed, because the `withSpan` helper is only about changing the active span, not the root span. If a new root span has been set within a `withSpan` helper callback, the root span will no longer be restored. We recommend setting a new root span before calling `withSpan` instead.
  
  ```js
  const rootSpan = tracer.rootSpan()
  const span = tracer.createSpan(...)
  tracer.withSpan(span, function(span) {
    tracer.createRootSpan(...)
  });
  // No longer match
  rootSpan != tracer.rootSpan()
  ```

### Fixed

- [8a32a21](https://github.com/appsignal/appsignal-nodejs/commit/8a32a2146862451028a5228534ffeb1a32e2f7a9) patch - Only allow open root spans to be set as root. This avoids closed root spans to be reused in child contexts.
- [4b74e2f](https://github.com/appsignal/appsignal-nodejs/commit/4b74e2f63910bd8875b5000f059f3ddb02452a43) patch - Don't return closed spans in `withSpan` helper. If a closed span was given to the `witSpan` helper it would temporarily overwrite the context with a closed span that cannot be modified. Instead it will return the current active span, if any. If no span was active it will return a `NoopSpan`.
- [1731c8e](https://github.com/appsignal/appsignal-nodejs/commit/1731c8ec55a54bab174b49be514edcd3a533cb8f) patch - Add `@opentelemetry/sdk-trace-base` package runtime dependency. Our OpenTelemetry SpanProcessor needs this package at runtime, not just at compile time.

## 2.4.1

### Fixed

- [d92583f](https://github.com/appsignal/appsignal-nodejs/commit/d92583f698bc7aae8648a564f3da914ac3b97097) patch - Do not instrument HTTP requests to the default socket.io path. This works around an issue where our HTTP instrumentation breaks socket.io's server side, causing the client side to get stuck in a connection loop.
- [3d22f15](https://github.com/appsignal/appsignal-nodejs/commit/3d22f15371c3eaf32843e69184455c11b8b8e68a) patch - Fix removing event listeners from wrapped event emitters. When using
  `tracer.wrapEmitter` to wrap an event emitter, it was not possible to remove
  any listeners that were added after the event emitter was wrapped.

## 2.4.0

### Added

- [60d7980](https://github.com/appsignal/appsignal-nodejs/commit/60d79808a414a4c0fe4b80a76b099e22835516ee) minor - Add OpenTelemetry span processor for the mysql and mysql2 packages. These are experimental integrations and require additional set up to integrate with OpenTelemetry.
- [9cd1c8b](https://github.com/appsignal/appsignal-nodejs/commit/9cd1c8bfc315ec9ec8ecc7be1e1b867b0466f7a7) patch - Add config options for disabling default instrumentation like HTTP, HTTPS, PostgreSQL (pg package) and Redis (node-redis package).
  
  The following configuration options have been added:
  
  - `instrumentHttp`
  - `instrumentPg`
  - `instrumentRedis`
  
  By default these configuration options are set to `true`, which means the instrumentation is active by default. If you want to disable one of these instrumentations, configure it by setting the configuration option to `false`.
  
  ```js
  // appsignal.js
  // Brief example, see our docs for a full example
  
  const appsignal = new Appsignal({
    instrumentRedis: false // Disables the node-redis package instrumentation
  });
  ```
- [3959858](https://github.com/appsignal/appsignal-nodejs/commit/3959858ec55ce67d19abb5abb52589a8948e39fd) patch - Add OpenTelemetry node-redis and ioredis query sanitizers. We recommend using these sanitizers to ensure no sensitive data is sent in query statements. Add the sanitizer to the `dbStatementSerializer` config as demonstrated below.
  
  ```js
  // tracing.js
  // Add the RedisDbStatementSerializer import
  const { RedisDbStatementSerializer } = require("@appsignal/nodejs");
  const { RedisInstrumentation } = require("@opentelemetry/instrumentation-redis");
  const sdk = new opentelemetry.NodeSDK({
    instrumentations: [
      new RedisInstrumentation({
        // Configure the AppSignal RedisDbStatementSerializer to sanitize queries
        dbStatementSerializer: RedisDbStatementSerializer
      })
    ]
  });
  ```
  
  The same can be done for the ioredis instrumentation:
  
  ```js
  // tracing.js
  // Add the IORedisDbStatementSerializer import
  const { IORedisDbStatementSerializer } = require('@appsignal/nodejs');
  const { IORedisInstrumentation } = require('@opentelemetry/instrumentation-ioredis');
  const sdk = new opentelemetry.NodeSDK({
    instrumentations: [
      // Add the IORedisInstrumentation
      new IORedisInstrumentation({
        // Configure the AppSignal IORedisDbStatementSerializer to sanitize queries
        dbStatementSerializer: IORedisDbStatementSerializer
      })
    ]
  });
  ```

### Changed

- [ee1ea8b](https://github.com/appsignal/appsignal-nodejs/commit/ee1ea8b7bcf557c2e236a234181fa461365f3071) patch - Use the OpenTelemetry SpanProcessor interface to build our own SpanProcessor. We previously copied the SpanProcessor code into our package, but instead we now use the OpenTelemetry interface directly. This should make our processor match the expected type better.
- [4e58a73](https://github.com/appsignal/appsignal-nodejs/commit/4e58a734b3bf4354a38f7b5f697e8b17a86fb89f) patch - Bump agent to v-0b43802.
  
  - Add redis and ioredis OpenTelemetry instrumentation support.
- [01c25d3](https://github.com/appsignal/appsignal-nodejs/commit/01c25d3415db0fafbe4b82a82a78327f5864c3b9) patch - Bump agent to v-1a8ac46
  
  - Support OpenTelemetry root span import.
  - Support OpenTelemetry HTTP instrumentation.
  - Support OpenTelemetry Express instrumentation.

### Fixed

- [8e45eba](https://github.com/appsignal/appsignal-nodejs/commit/8e45eba34b93b6b979a47298015ca20876a71bc3) patch - Fix the `ScopeManager.active()` function returning closed spans.
- [6d2e2d5](https://github.com/appsignal/appsignal-nodejs/commit/6d2e2d5b02d2684401368e87eb367e380f451eb7) patch - Do not transfer closed spans for new async contexts in the ScopeManager. Rather than relying on `ScopeManager.active()` and `ScopeManager.root()` to make sure the span is not already closed, also make sure it's not closed when transferring spans around between async contexts.

## 2.3.6

### Added

- [33f7864](https://github.com/appsignal/appsignal-nodejs/commit/33f78644295bca0a8395b7600798506498cd9229) patch - Add the `createRootSpan` function to the Tracer to allow explicit creation of RootSpans even if another RootSpan already exists and is tracked as the current RootSpan. Make sure to not forget about the previous RootSpan, and close it as well at some point when using this function.

## 2.3.5

### Changed

- [fc9f2fd](https://github.com/appsignal/appsignal-nodejs/commit/fc9f2fd1936ed8abf0dee8e419d4d7eaa32efb03) patch - Use the Node.js performance module as high-resolution timer for span creation and close times. This provides more accurate times and improves compatibility with other systems in the future.

### Fixed

- [c2931af](https://github.com/appsignal/appsignal-nodejs/commit/c2931af6f66e8036c179e9e1f67153321d897414) patch - When instrumenting an outgoing HTTP request, read the `host` property from the request options if the `hostname` property is not present. This fixes a bug where outgoing HTTP request hosts would be shown as `http://localhost`.
- [4c57751](https://github.com/appsignal/appsignal-nodejs/commit/4c57751afce5abf0e771ee21c858ce30e60760f9) patch - Fix error on Microsoft Windows machines on install. The AppSignal extension still won't install on Windows, but now it won't cause an error while checking a development mode condition if it should build the TypeScript package.

## 2.3.4

### Changed

- [ff871bf](https://github.com/appsignal/appsignal-nodejs/commit/ff871bf7f268f53b83f0de0fcc39c47b832fd9a9) patch - Update node-gyp to major version `9.0.0`. This drops compatibility with Python 2.7 for the extension install, but it makes it compatible with the latest Python 3 version, which should be more accessible to users going forward.

### Fixed

- [817fdb4](https://github.com/appsignal/appsignal-nodejs/commit/817fdb4f6c20ca64fe33205c5d15098a93bda7e2) patch - Ensure the root span is preserved across scopes. Due to a bug in the scope management logic, calling `tracer.withSpan` could cause the root span for a given scope to be forgotten.

## 2.3.3

### Added

- [8f745e6](https://github.com/appsignal/appsignal-nodejs/commit/8f745e6c7d5b70ab01b6cdf87ae0afcbe66850a6) patch - Log messages are now sent through a new centralized logger that writes to `/tmp/appsignal.log` by default.
  A warning is printed to STDERR when the default or provided logPath is not accessible, and the Logger
  automatically falls back to STDOUT. Use config option `log: stdout` to log AppSignal messages to STDOUT instead.

### Changed

- [9a7fafe](https://github.com/appsignal/appsignal-nodejs/commit/9a7fafed628ee1931dd70640f4da9f8ae4bc740e) patch - Bump agent to v-bbc830a
  
  - Support batched statsd messages
  - Set start times for spans with traceparents
  - Check duration in transactions for negative and too high values
- [df63d2d](https://github.com/appsignal/appsignal-nodejs/commit/df63d2d79e1d5829264fc17fe88e6cabfc10edfc) patch - Bump agent to v-f57e6cb
  
  - Enable process metrics on Heroku and Dokku

### Fixed

- [4a498be](https://github.com/appsignal/appsignal-nodejs/commit/4a498be6f43d4ebe1cf786d14d21aae7ab19a9b3) patch - Allow nested values in `Span.setSampleData`. This change also allows
  values other than strings, integers and booleans to be passed as values
  within the sample data objects. Note that not all sample data keys allow
  nested values to be passed.
- [4ab4814](https://github.com/appsignal/appsignal-nodejs/commit/4ab481483e86425d1b6c072c4f85f88768c792c6) patch - Follow redirects when downloading the AppSignal agent. This fixes an issue where the redirect page would be downloaded instead of the agent, causing the agent installation to fail.
- [17c0deb](https://github.com/appsignal/appsignal-nodejs/commit/17c0deb277fa53ba5cbce2cd0623e2af58cccace) patch - Fix an issue where the AppSignal extension would throw an error when an object containing a non-integer number is sent to it. This would be triggered when calling `setSampleData` with an object containing a non-integer number, or when the values for a metric's tags are non-integer numbers.

## 2.3.2

### Changed

- [7a7e5c5](https://github.com/appsignal/appsignal-nodejs/commit/7a7e5c5b494922084e15d8cb84dc9de8673c3d33) patch - Update the expected Span type in ScopeManager to `Span` from the `@appsignal/nodejs` package, rather than the `NodeSpan` from the `@appsignal/types` package. The type definition is the same, but now all Span types used by the Node.js integration are defined in the `@appsigna/nodejs` package.
- [7fc5e40](https://github.com/appsignal/appsignal-nodejs/commit/7fc5e40befca0cde2edb6d56ee3a12ad58fec06d) patch - Improve memory usage when extension is not initialized. It will no longer initialize a new empty Tracer object when the extension is not loaded or AppSignal is not active.
- [47a851b](https://github.com/appsignal/appsignal-nodejs/commit/47a851b380516b7ac2129ec294cf65ac6329c1bd) patch - Update @appsignal/types dependency to 3.0.0.

### Removed

- [32d8054](https://github.com/appsignal/appsignal-nodejs/commit/32d8054e5613e11a77fa3d98f246c72d3f98efa0) patch - Remove the private function `Span.toJSON`. This wasn't previously marked as private, but it was.
- [178b49a](https://github.com/appsignal/appsignal-nodejs/commit/178b49ac0bef06cbf8915e7727a82c69a142372d) patch - Do not ship the extension install script test files in the published package. Reduces the package size a tiny bit.
- [0af54b7](https://github.com/appsignal/appsignal-nodejs/commit/0af54b735e9ad4f7ceb22352008d07ebadcba1a9) patch - Remove the unused experimental module.

### Fixed

- [083a39a](https://github.com/appsignal/appsignal-nodejs/commit/083a39a159ed60fbbd615486b3e596e27b700b4e) patch - Show errors in loading the extension when the `@appsignal/nodejs` module is required.
- [afe221e](https://github.com/appsignal/appsignal-nodejs/commit/afe221e2a892d4dda068637a3f60ac31447ac33f) patch - The minutely probes are now stopped when `Appsignal.stop()` is called. This fixes an issue where Jest tests would warn about asynchronous operations that remain pending after the tests.

## 2.3.1

### Fixed

- [531e5bf](https://github.com/appsignal/appsignal-nodejs/commit/531e5bf14b078c9294d61c71cd62948bb3f3608c) patch - The supported Redis version is now locked to 3.x.x. This will prevent app startup failures for users
  with Redis 4.x.x.

## 2.3.0

### Added

- [6d1cfec](https://github.com/appsignal/appsignal-nodejs/commit/6d1cfec83e8ca19331aa114fe7f85b4ea5a179f0) patch - Implement unregister method for probes. You can now call the
  `probes.unregister(name)` method to unregister a probe by name.

### Changed

- [4c453cc](https://github.com/appsignal/appsignal-nodejs/commit/4c453ccf140c59090197a8ebfb79d39c77f31a91) minor - The extension package (@appsignal/nodejs-ext) is no longer a separated dependency.
  The extension is part of the @appsignal/nodejs package now.
- [675fa15](https://github.com/appsignal/appsignal-nodejs/commit/675fa1510dcc162adf87488fff07f237e2d3c8f0) patch - Update install report path location. The "nodejs" package now stores the install report in its own package path, with the rest of the extension files. This makes it easier to access by the diagnose report.
- [56fb794](https://github.com/appsignal/appsignal-nodejs/commit/56fb794a72e99d77f787000bf2a5bf95efc44565) patch - Improve the reporting of extension loading state in the diagnose report. Previously it would only report it as loaded when it was also running.
- [56fb794](https://github.com/appsignal/appsignal-nodejs/commit/56fb794a72e99d77f787000bf2a5bf95efc44565) patch - Change the way the extension is started. Previously it was started on initialization of the extension class (if the config was active), but now it's started by the client class.
- [733ee15](https://github.com/appsignal/appsignal-nodejs/commit/733ee15be5c548f8098a758307b70e58ae0b294f) patch - Remove the `os` and `cpu` fields from the `package.json`. This will prevent installations from failing on unlisted CPU architectures and Operating Systems. Our extension installer script will do this check instead. The package should not fail to install when it encounters an unsupported CPU architecture or Operating System.
- [ddc7e19](https://github.com/appsignal/appsignal-nodejs/commit/ddc7e19277409552db671e68bdfd88fea95e8f57) patch - Update package metadata to specify the package repository.

### Fixed

- [fa955af](https://github.com/appsignal/appsignal-nodejs/commit/fa955af0a6f4378b0ec06aec3305095334eb81ad) patch - Add a hostname tag to V8 probe metrics. This fixes an issue where metrics' values
  would be overriden between different hosts.
- [72c54a4](https://github.com/appsignal/appsignal-nodejs/commit/72c54a4e3cc04b6e0fb1bb1a8c87b657e4bc7a37) patch - Setting `enableMinutelyProbes` to `false` now disables the minutely probes
  system. Custom probes will not be called when the minutely probes are
  disabled. In addition, the `APPSIGNAL_ENABLE_MINUTELY_PROBES` environment
  variable can now be used to enable or disable the minutely probes.
  
  Before this change, setting `enableMinutelyProbes` to `false` would not
  register the default Node.js heap statistics minutely probe, but custom
  probes would still be called. To opt in for the previous behaviour,
  disabling only the Node.js heap statistics minutely probe without disabling
  custom probes, you can use the `probes.unregister()` method to unregister
  the default probe:
  
  ```js
  const probes = appsignal.metrics().probes();
  probes.unregister("v8_stats");
  ```
- [bb62525](https://github.com/appsignal/appsignal-nodejs/commit/bb62525f64530ba451a2f55a6ac1807e082b1d92) patch - Use the APPSIGNAL_ACTIVE environment variable to determine whether AppSignal is active.
- [f52a824](https://github.com/appsignal/appsignal-nodejs/commit/f52a824ea40625c60c136c705e0da74e195e6050) patch - Fix the extension function fallbacks on installation failure. When the extension fails to install and calls are made to the not loaded functions, it will no longer throw an error.

## 2.2.10

### Changed

- patch - Update @appsignal/nodejs-ext dependency to 2.0.7.

## 2.2.9

### Added

- [d2defeb](https://github.com/appsignal/appsignal-nodejs/commit/d2defeb1910999bca3d39c724e583079999d55ab) patch - The `sendSessionData` config option is now available. When set to `false`, it prevents the
  integration from sending session data to AppSignal.

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

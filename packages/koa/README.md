# `@appsignal/koa`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/koa) ![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/@appsignal/koa/peer/koa)

The AppSignal for Node.js integration for Koa (`koa`) v2.0.0+.

## Installation

First, [sign up for an AppSignal account][appsignal-sign-up] and add both the `@appsignal/nodejs` and `@appsignal/koa` packages to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs @appsignal/koa
npm install --save @appsignal/nodejs @appsignal/koa
```

You can then import and use the package in your app.

## Usage

The module includes an AppSignal intrumentation plugin for automatically instrumenting the middlewares or routes of your application.

```js
// AT THE VERY TOP OF THE ENTRYPOINT OF YOUR APPLICATION...

const { Appsignal } = require("@appsignal/nodejs");

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>"
});

appsignal.instrument(require("@appsignal/koa"));

// ...ALL THE REST OF YOUR IMPORTS AND CODE GO HERE!

const Koa = require("koa");
const Router = require("@koa/router"); // @koa/router is also supported out of the box!

const app = new Koa();

// Add error handling

app.on("error", (error) => {
  appsignal
    .tracer()
    .setError(error)
});
```

Note that generator-based middleware was deprecated in Koa version 2.x, and the next major Koa version will remove support for them entirely.

Our instrumentation does not instrument generator-based middleware. The [Koa 2.x migration guide][guide] explains how you can use the `koa-convert` library to convert them to new-style async middleware.

[guide]: https://github.com/koajs/koa/blob/v2.x/docs/migration.md#using-v1x-middleware-in-v2x

## Contributing

Thinking of contributing to this repo? Awesome! 🚀

Please follow our [Contributing guide][contributing-guide] in our documentation and follow our [Code of Conduct][coc].

Also, we would be very happy to send you Stroopwafles. Have look at everyone we send a package to so far on our [Stroopwafles page][waffles-page].

## Support

[Contact us][contact] and speak directly with the engineers working on AppSignal. They will help you get set up, tweak your code and make sure you get the most out of using AppSignal.

[appsignal]: https://appsignal.com
[appsignal-sign-up]: https://appsignal.com/users/sign_up
[contact]: mailto:support@appsignal.com
[coc]: https://docs.appsignal.com/appsignal/code-of-conduct.html
[waffles-page]: https://appsignal.com/waffles
[docs]: https://docs.appsignal.com/nodejs/
[contributing-guide]: http://docs.appsignal.com/appsignal/contributing.html
[semver]: http://semver.org/

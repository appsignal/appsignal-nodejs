# `@appsignal/express`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/express) ![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/@appsignal/express/peer/express)

The AppSignal for Node.js integration for Express.js (`express`) v4.0.0+.

⚠️  This package is no longer required for AppSignal for Node.js [version 3.0](https://docs.appsignal.com/nodejs/3.x.html). If you use version 3.0 or newer in your app, please remove this package from your `package.json` file.

## Installation

First, [sign up for an AppSignal account][appsignal-sign-up] and add both the `@appsignal/nodejs` and `@appsignal/express` packages to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs @appsignal/express
npm install --save @appsignal/nodejs @appsignal/express
```

You can then import and use the package in your app. 

## Usage

### Middleware

The module includes middleware for automatically instrumenting the routes of your application.

```js
const { Appsignal } = require("@appsignal/nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>"
})

const express = require("express")
const { expressMiddleware } = require("@appsignal/express")

const app = express()

// ADD THIS AFTER ANY OTHER EXPRESS MIDDLEWARE, BUT BEFORE ANY ROUTES!
app.use(expressMiddleware(appsignal))
```

### Error Handler

The module also contains a middleware for catching any errors passed to `next()`.

```js
const { Appsignal } = require("@appsignal/nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>"
  pushApiKey: "<YOUR API KEY>"
})

const express = require("express")
const { expressErrorHandler } = require("@appsignal/express")

const app = express()

// ADD THIS AFTER ANY OTHER EXPRESS MIDDLEWARE, AND AFTER ANY ROUTES!
app.use(expressErrorHandler(appsignal))
```

An example Express app, containing usage of all of our middleware and custom instrumentation can be found [here](https://github.com/appsignal/appsignal-examples/tree/express).

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

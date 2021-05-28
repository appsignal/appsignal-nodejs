# `@appsignal/nodejs`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/nodejs) ![node-current (scoped)](https://img.shields.io/node/v/@appsignal/nodejs)

The core AppSignal for Node.js library.

See also the [mono repo README](../../README.md) for more information.

## Installation

First, [sign up][appsignal-sign-up] for an AppSignal account and run our automated install tool, which will install `@appsignal/nodejs` and any relevant integrations to your project:

```bash
npx @appsignal/cli install
```

You can also skip the automated tool and add `@appsignal/nodejs` to your `package.json` on the command line with `npm`/`yarn`:

```bash
yarn add @appsignal/nodejs
npm install --save @appsignal/nodejs
```

Alternatively, you can manually add the `@appsignal/nodejs` package to your `package.json`. Then, run `yarn install`/`npm install`.

> Installing the AppSignal for Node.js integration builds a native extension. In order to compile it, macOS users will need to install the [Xcode Developer Tools](https://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/). Linux users will need the dependencies outlined here. Windows is not supported.

You can then import and use the package in your bundle:

```js
const { Appsignal } = require("@appsignal/nodejs");

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>"
  apiKey: "<YOUR API KEY>"
});

// ...all the rest of your code goes here!
```

> In order to auto-instrument modules, the Appsignal module must be both **required** and **initialized** before any other package.

[appsignal]: https://appsignal.com
[appsignal-sign-up]: https://appsignal.com/users/sign_up
[contact]: mailto:support@appsignal.com
[coc]: https://docs.appsignal.com/appsignal/code-of-conduct.html
[waffles-page]: https://appsignal.com/waffles
[docs]: https://docs.appsignal.com/nodejs/
[contributing-guide]: http://docs.appsignal.com/appsignal/contributing.html
[semver]: http://semver.org/

# `@appsignal/nodejs`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/nodejs) ![node-current (scoped)](https://img.shields.io/node/v/@appsignal/nodejs)

The core AppSignal for Node.js library.

## Installation

First, sign up for an AppSignal account and add the `@appsignal/nodejs` package to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs
npm install --save @appsignal/nodejs
```

You can then import and use the package in your bundle:

```js
const { Appsignal } = require("@appsignal/nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>"
  apiKey: "<YOUR API KEY>"
})
```

## Usage

For more details on how to use this library and the AppSignal service, see [our documentation][docs].

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

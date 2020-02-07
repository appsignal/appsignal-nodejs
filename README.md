# AppSignal for Node.js

- [AppSignal.com website][appsignal]
- [Documentation][docs]
- [Support][contact]

[![Build Status](https://travis-ci.org/appsignal/appsignal-nodejs.svg?branch=master)](https://travis-ci.org/appsignal/appsignal-nodejs) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

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

## Development

### Installation

This repository is a Lerna-managed monorepo, containing packages (located in the `/packages` directory) that map to separate `npm` modules.

To install the dependencies:

```bash
yarn install
lerna bootstrap
```

You can then run the following to start the compiler in _watch_ mode. 

```bash
yarn build:watch
```

You can also build the library without watching the directory:

```
yarn build
```

### Testing

The tests for this library use [Jest](https://jestjs.io) as the test runner. Once you've installed the dependencies, you can run the following command in the root of this repository to run the tests for all packages, or in the directory of a package to run only the tests pertaining to that package:

```bash
yarn test
```

### Versioning

This repo uses [Semantic Versioning][semver] (often referred to as _semver_). Each package in the repository is versioned independently from one another.

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
[docs]: https://docs.appsignal.com/front-end/
[contributing-guide]: http://docs.appsignal.com/appsignal/contributing.html

[semver]: http://semver.org/

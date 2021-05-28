# AppSignal for Node.js

- [AppSignal.com website][appsignal]
- [Documentation][docs]
- [Support][contact]

[![Build Status](https://appsignal.semaphoreci.com/badges/appsignal-nodejs/branches/main.svg?style=shields&key=7dd9fe64-f1d5-437b-a5b7-8ac337a26c5b)](https://travis-ci.org/appsignal/appsignal-nodejs) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

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

> Installing the AppSignal for Node.js integration builds a native extension. To compile it, macOS users will need to install the [Xcode Developer Tools](https://osxdaily.com/2014/02/12/install-command-line-tools-mac-os-x/). Linux users will need the dependencies outlined here. Windows is not supported.

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

> To auto-instrument modules, the Appsignal module must be both **required** and **initialized** before any other package.

## Development

### Installation

This repository is a [mono-managed monorepo](https://github.com/appsignal/mono/), containing packages (located in the `/packages` directory) that map to separate `npm` modules.

First install mono on your local machine by [following the mono installation steps](https://github.com/appsignal/mono/#installation).

Then install the dependencies and prepare the project for development use using mono:

```bash
mono bootstrap
```

You can then run the following to start the compiler in _watch_ mode.

```bash
mono run npm run build:watch --parallel
```

You can also build the library without watching the directory:

```bash
mono build
```

Version management configuration is provided for [`asdf`](https://github.com/asdf-vm/asdf-nodejs).

### Testing

The tests for this library use [Jest](https://jestjs.io) as the test runner. Once you've installed the dependencies, you can run the following command in the root of this repository to run the tests for all packages, or in the directory of a package to run only the tests pertaining to that package:

```bash
mono test
```

### Versioning

This repo uses [Semantic Versioning][semver] (often referred to as _semver_). Each package in the repository is versioned independently from one another.

## Contributing

Thinking of contributing to this repo? Awesome! 🚀

Please follow our [Contributing guide][contributing-guide] in our documentation and follow our [Code of Conduct][coc].

Also, we would be very happy to send you Stroopwafels. Have look at everyone we send a package to so far on our [Stroopwafels page][waffles-page].

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

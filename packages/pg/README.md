# `@appsignal/pg`

The AppSignal for Node.js integration for node-postgres (`pg`) v8.0.0+.

## Installation

First, [sign up for an AppSignal account][appsignal-sign-up] and add both the `@appsignal/nodejs` and `@appsignal/pg` packages to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs @appsignal/pg
npm install --save @appsignal/nodejs @appsignal/pg
```

You can then import and use the package in your app. 

⚠️ *Important:* Ensure you require _and_ initialize the `Appsignal` module before you call `require("pg")`.

```js
const { Appsignal } = require("@appsignal/nodejs")
const pgPlugin = require("@appsignal/pg")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>"
  apiKey: "<YOUR API KEY>"
}).instrument(pgPlugin)

const { Client } = require("pg") // or, this could be a library that depends on `pg`
```

The integration will then track any queries made to Postgres, and send metrics and statistics to AppSignal. This also works with any library that depends on `pg` as its database adapter, such as [`knex`](http://knexjs.org/).

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

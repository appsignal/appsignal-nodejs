# `@appsignal/next-js`

The AppSignal integration for [Next.js](https://nextjs.org/) 9.3.0+ and Node.js. It is recommended to be used with [`@appsignal/javascript`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/javascript) and [`@appsignal/react`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/react) on the client side.

At this time, it's only possible to use this integration with a [custom server script](https://nextjs.org/docs/advanced-features/custom-server). The integration does not work when using the Next CLI (e.g. `next start`). If you plan to use this in a serverless environment, we recommend just using [`@appsignal/javascript`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/javascript) and the [`@appsignal/react`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/react) integration.

## Installation

First, [sign up for an AppSignal account][appsignal-sign-up] and add both the `@appsignal/nodejs` and `@appsignal/next-js` packages to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs @appsignal/next-js
npm install --save @appsignal/nodejs @appsignal/next-js
```

You can then import and use the package in your app. 

The `@appsignal/next-js` package exports the `getRequestHandler()` function, which is designed to be used in the place of the `app.getRequestHandler()` method provided by the `next` module. 

Create a `server.js` in your project root and add the following:

```js
const { Appsignal } = require("@appsignal/nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  apiKey: "<YOUR API KEY>"
})

const { parse } = require("url")
const next = require("next")
const { getRequestHandler } = require("@appsignal/next-js")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = getRequestHandler(appsignal, app)

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    if (pathname === "/a") {
      app.render(req, res, "/b", query)
    } else if (pathname === "/b") {
      app.render(req, res, "/a", query)
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(3000, err => {
    if (err) throw err
    console.log("> Ready on http://localhost:3000")
  })
})
```

The integration will then track any queries served by to Next.js, and send metrics and statistics to AppSignal. This also works great with Express and the `@appsignal/express` integration:

```js
const { Appsignal } = require("@appsignal/nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  apiKey: "<YOUR API KEY>"
})

const next = require("next")

const { expressErrorHandler, expressMiddleware } = require("@appsignal/express")

const next = require("next")
const express = require("express")
const { getRequestHandler } = require("@appsignal/next-js")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = getRequestHandler(appsignal, app)

app.prepare().then(() => {
  express()
    .use(expressMiddleware(appsignal))
    .use(getRequestHandler(appsignal, app))
    .use(expressErrorHandler(appsignal))
    .listen(PORT, err => {
      if (err) {
        throw err
      }

      // eslint-disable-next-line no-console
      console.log(`> Ready on http://localhost:${PORT}`)
    })
})
```

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


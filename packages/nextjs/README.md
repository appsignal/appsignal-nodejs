# `@appsignal/nextjs`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/nextjs) ![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/@appsignal/nextjs/peer/next)

The AppSignal integration for [Next.js](https://nextjs.org/) 9.3.0+, designed to be used in conjunction with `@appsignal/nodejs`. 

⚠️  This package is no longer required for AppSignal for Node.js [version 3.0](https://docs.appsignal.com/nodejs/3.x.html). If you use version 3.0 or newer in your app, please remove this package from your `package.json` file.

It is recommended to be used with [`@appsignal/javascript`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/javascript) and [`@appsignal/react`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/react) on the client side for full-stack performance monitoring and error tracking.

At this time, it's only possible to use this integration with a [custom server script](https://nextjs.org/docs/advanced-features/custom-server). The integration **does not** work when using the Next CLI (e.g. `next start`). 

If you plan to use this in a serverless environment, we recommend using just [`@appsignal/javascript`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/javascript) and the [`@appsignal/react`](https://github.com/appsignal/appsignal-javascript/tree/develop/packages/react) integration.

## Installation

First, [sign up for an AppSignal account][appsignal-sign-up] and add both the `@appsignal/nodejs` and `@appsignal/nextjs` packages to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs @appsignal/nextjs
npm install --save @appsignal/nodejs @appsignal/nextjs
```

You can then import and use the package in your app. 

## Usage

The `@appsignal/nextjs` package exports the `getRequestHandler()` function, which is designed to be used in the place of the `app.getRequestHandler()` method provided by the `next` module. 

Create a `server.js` in your project root and add the following:

```js
// ENSURE APPSIGNAL IS THE FIRST THING TO BE REQUIRED/IMPORTED
// INTO YOUR APP!
const { Appsignal } = require("@appsignal/nodejs");

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>",
});

const { getRequestHandler } = require("@appsignal/nextjs");

const url = require("url");
const next = require("next");

const PORT = parseInt(process.env.PORT, 10) || 3000;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = getRequestHandler(appsignal, app);

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === "/a") {
      app.render(req, res, "/b", query);
    } else if (pathname === "/b") {
      app.render(req, res, "/a", query);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
```

The integration will then track any queries served by to Next.js, and send metrics and statistics to AppSignal. This also works great with Express and the `@appsignal/express` integration:

```js
// ENSURE APPSIGNAL IS THE FIRST THING TO BE REQUIRED/IMPORTED
// INTO YOUR APP!
const { Appsignal } = require("@appsignal/nodejs");

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>",
});

const { getRequestHandler } = require("@appsignal/nextjs");

const {
  expressErrorHandler,
  expressMiddleware,
} = require("@appsignal/express");

const next = require("next");
const express = require("express");

const PORT = parseInt(process.env.PORT, 10) || 3000;

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

app.prepare().then(() => {
  express()
    .use(expressMiddleware(appsignal))
    .use(getRequestHandler(appsignal, app))
    .use(expressErrorHandler(appsignal))
    .listen(PORT, (err) => {
      if (err) {
        throw err;
      }

      console.log(`> Ready on http://localhost:${PORT}`);
    });
});
```

## Web Vitals Reporting (EXPERIMENTAL)

**Requires Next.js v9.4.0+**

In Next.js 9.4.0, support was added for [Core Web Vitals](https://web.dev/vitals/) reporting. Core Web Vitals are the quality signals key to delivering great UX on the web, on top of which the famous [Lighthouse](https://developers.google.com/web/tools/lighthouse) reports are built. `@appsignal/nextjs` includes experimental support for sending these metrics to AppSignal.com.

This works by providing a handler function, which is designed to be used as an endpoint in your application. When called, the `pathname`  of the request must be equal to `/__appsignal-web-vitals`. 

```js
const { Appsignal } = require("@appsignal/nodejs");

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>",
});

const {
  getRequestHandler,
  EXPERIMENTAL: { getWebVitalsHandler },
} = require("@appsignal/nextjs");

const url = require("url");
const next = require("next");

const PORT = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });

const handle = getRequestHandler(appsignal, app);
const vitals = getWebVitalsHandler(appsignal);

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = url.parse(req.url, true);
    const { pathname, query } = parsedUrl;

    if (pathname === "/__appsignal-web-vitals") {
      vitals(req, res);
    } else {
      handle(req, res, parsedUrl);
    }
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
```

If you're using Express with Next.js, the function also works as an Express middleware. If used as an Express middleware, the `/__appsignal-web-vitals` endpoint will be made available automatically:

```js
app.prepare().then(() => {
  express()
    .use(expressMiddleware(appsignal))
    .use(getWebVitalsHandler(appsignal))
    .use(getRequestHandler(appsignal, app))
    .use(expressErrorHandler(appsignal))
    .listen(PORT, (err) => {
      if (err) {
        throw err;
      }

      // eslint-disable-next-line no-console
      console.log(`> Ready on http://localhost:${PORT}`);
    });
});
```

Once mounted to your app, you can `POST` useful metrics to the `/__appsignal-web-vitals` endpoint by exporting a `reportWebVitals` function from `pages/_app.js`:

```js
export function reportWebVitals(metric) {
  const body = JSON.stringify(metric);
  const url = "/__appsignal-web-vitals";

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
  (navigator.sendBeacon && navigator.sendBeacon(url, body)) ||
    fetch(url, { body, method: "POST", keepalive: true });
}
```

On successful setup, two new [magic dashboards](https://blog.appsignal.com/2019/03/27/magic-dashboards.html) will be created for you - Next.js and Next.js Web Vitals.

Usage of this feature is **EXPERIMENTAL** and may change or be deprecated in future releases.

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


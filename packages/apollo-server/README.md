# `@appsignal/apollo-server`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/apollo-server) ![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/@appsignal/apollo-server/peer/apollo-server)

The AppSignal for Node.js integration for Apollo GraphQL (`apollo-server`) v2.0.0+.

## Installation

First, [sign up for an AppSignal account][appsignal-sign-up] and add both the `@appsignal/nodejs` and `@appsignal/apollo-server` packages to your `package.json`. Then, run `yarn install`/`npm install`.

You can also add these packages to your `package.json` on the command line:

```bash
yarn add @appsignal/nodejs @appsignal/apollo-server
npm install --save @appsignal/nodejs @appsignal/apollo-server
```

You can then import and use the package in your app. 

## Usage

The module includes an Apollo Server plugin for automatically instrumenting the resolvers of your application.

```js
// ENSURE APPSIGNAL IS THE FIRST THING TO BE REQUIRED/IMPORTED
// INTO YOUR APP!
const { Appsignal } = require("@appsignal/nodejs")
const { createApolloPlugin } = require("@appsignal/apollo-server")

// You can also use one of the apollo-server integrations here,
// e.g. `apollo-server-<integration>`. Note that you will also need to require
// the AppSignal integration seperately.
const { ApolloServer } = require("apollo-server")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  apiKey: "<YOUR API KEY>"
})

// The GraphQL schema
const typeDefs = gql`
  type Query {
    "A simple type for getting started!"
    hello: String
  }
`

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => 'world',
  },
}

const server = new ApolloServer({
  typeDefs: importSchema('./schema.graphql'),
  resolvers,
  plugins: [createApolloPlugin(appsignal)]
})

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
})
```

An example `apollo-server` app, containing usage of all of our middleware and custom instrumentation can be found [here](https://github.com/appsignal/appsignal-examples/tree/apollo-server).

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

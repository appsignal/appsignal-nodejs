# `@appsignal/nodejs-ext`

![npm (scoped)](https://img.shields.io/npm/v/@appsignal/nodejs-ext) ![node-current (scoped)](https://img.shields.io/node/v/@appsignal/nodejs-ext)

This package contains the C++ native extension for `@appsignal/nodejs`, and the install script for the agent. The native extension is a bridge between the Node.js runtime and [our agent](https://docs.appsignal.com/appsignal/how-appsignal-operates.html#agent).

This package should only be used by `@appsignal/nodejs`, and you should never install and use it by itself unless you really, _really_ know what you're doing.

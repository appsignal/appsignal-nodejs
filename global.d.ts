import { Client } from "./src/client"

declare global {
  // eslint-disable-next-line no-var
  var __APPSIGNAL__: Client
}

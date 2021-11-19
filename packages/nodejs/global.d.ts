export {}

import { Client } from "./src/interfaces"

declare global {
  var __APPSIGNAL__: Client
}

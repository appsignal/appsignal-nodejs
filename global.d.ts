import { Client } from "./src/client"

declare global {
  namespace NodeJS {
    interface Global {
      __APPSIGNAL__: Client
    }
  }
}

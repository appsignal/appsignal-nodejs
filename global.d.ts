import { Client } from "./src/interfaces"

declare global {
  namespace NodeJS {
    interface Global {
      __APPSIGNAL__: Client
    }
  }
}

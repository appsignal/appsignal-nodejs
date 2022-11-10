import type { DefaultInstrumentationName } from "../client"

export type AppsignalOptions = {
  active: boolean
  caFilePath: string
  disableDefaultInstrumentations: DefaultInstrumentationName[] | boolean
  dnsServers: string[]
  enableHostMetrics: boolean
  enableMinutelyProbes: boolean
  enableStatsd: boolean
  endpoint: string
  environment: string
  filesWorldAccessible: boolean
  filterParameters: string[]
  filterSessionData: string[]
  hostname: string
  httpProxy: string
  ignoreActions: string[]
  ignoreErrors: string[]
  ignoreNamespaces: string[]
  log: string
  logPath: string
  logLevel: string
  loggingEndpoint: string
  name: string
  pushApiKey: string
  requestHeaders: string[]
  revision: string
  runningInContainer: boolean
  sendParams: boolean
  sendSessionData: boolean
  workingDirectoryPath: string
}

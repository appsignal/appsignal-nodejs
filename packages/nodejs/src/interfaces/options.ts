export interface AppsignalOptions {
  name: string
  apiKey: string
  active: boolean
  debug: boolean
  logPath: string
  log: string
  endpoint: string
  caFilePath: string
  hostname: string
  sendParams: string[]
  filterParameters: string[]
  filterSessionData: string[]
  dnsServers: string[]
  ignoreActions: string[]
  ignoreErrors: string[]
  ignoreNamespaces: string[]
  ignoreInstrumentation: string[]
  httpProxy: string
  runningInContainer: boolean
  workingDirPath: string
  workingDirectoryPath: string
  enableHostMetrics: boolean
  enableMinutelyProbes: boolean
  enableStatsd: boolean
  skipSessionData: boolean
  filesWorldAccessible: boolean
  requestHeaders: string[]
  revision: string
  environment: string
  [key: string]: string | string[] | boolean
}

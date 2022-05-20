export interface AppsignalOptions {
  active: boolean
  apiKey: string
  caFilePath: string
  debug: boolean
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
  ignoreInstrumentation: string[]
  ignoreNamespaces: string[]
  instrumentHttp: boolean
  instrumentHttps: boolean
  instrumentPg: boolean
  instrumentRedis: boolean
  log: string
  logPath: string
  name: string
  pushApiKey: string
  requestHeaders: string[]
  revision: string
  runningInContainer: boolean
  sendParams: boolean
  skipSessionData: boolean
  workingDirPath: string
  workingDirectoryPath: string
  [key: string]: string | string[] | boolean
}

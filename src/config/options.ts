import type { DefaultInstrumentationName } from "../client"

export type AppsignalOptions = {
  active: boolean
  bindAddress: string
  caFilePath: string
  cpuCount: number
  disableDefaultInstrumentations: DefaultInstrumentationName[] | boolean
  dnsServers: string[]
  enableHostMetrics: boolean
  enableMinutelyProbes: boolean
  enableOpentelemetryHttp: boolean
  enableStatsd: boolean
  enableNginxMetrics: boolean
  endpoint: string
  environment: string
  filesWorldAccessible: boolean
  filterParameters: string[]
  filterSessionData: string[]
  hostname: string
  hostRole: string
  httpProxy: string
  ignoreActions: string[]
  ignoreErrors: string[]
  ignoreLogs: string[]
  ignoreNamespaces: string[]
  initializeOpentelemetrySdk: boolean
  log: string
  logPath: string
  logLevel: string
  loggingEndpoint: string
  name: string
  nginxPort: string
  opentelemetryPort: string
  pushApiKey: string
  requestHeaders: string[]
  revision: string
  runningInContainer: boolean
  sendEnvironmentMetadata: boolean
  sendParams: boolean
  sendSessionData: boolean
  statsdPort: string
  workingDirectoryPath: string
}

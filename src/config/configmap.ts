import type { AppsignalOptions } from "./options"

/** @internal */
export const ENV_TO_KEY_MAPPING = {
  APPSIGNAL_ACTIVE: "active",
  APPSIGNAL_APP_ENV: "environment",
  APPSIGNAL_APP_NAME: "name",
  APPSIGNAL_BIND_ADDRESS: "bindAddress",
  APPSIGNAL_CA_FILE_PATH: "caFilePath",
  APPSIGNAL_CPU_COUNT: "cpuCount",
  APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS: "disableDefaultInstrumentations",
  APPSIGNAL_DNS_SERVERS: "dnsServers",
  APPSIGNAL_ENABLE_HOST_METRICS: "enableHostMetrics",
  APPSIGNAL_ENABLE_OPENTELEMETRY_HTTP: "enableOpentelemetryHttp",
  APPSIGNAL_ENABLE_MINUTELY_PROBES: "enableMinutelyProbes",
  APPSIGNAL_ENABLE_STATSD: "enableStatsd",
  APPSIGNAL_ENABLE_NGINX_METRICS: "enableNginxMetrics",
  APPSIGNAL_FILES_WORLD_ACCESSIBLE: "filesWorldAccessible",
  APPSIGNAL_FILTER_PARAMETERS: "filterParameters",
  APPSIGNAL_FILTER_SESSION_DATA: "filterSessionData",
  APPSIGNAL_HOSTNAME: "hostname",
  APPSIGNAL_HOST_ROLE: "hostRole",
  APPSIGNAL_HTTP_PROXY: "httpProxy",
  APPSIGNAL_IGNORE_ACTIONS: "ignoreActions",
  APPSIGNAL_IGNORE_ERRORS: "ignoreErrors",
  APPSIGNAL_IGNORE_LOGS: "ignoreLogs",
  APPSIGNAL_IGNORE_NAMESPACES: "ignoreNamespaces",
  APPSIGNAL_INITIALIZE_OPENTELEMETRY_SDK: "initializeOpentelemetrySdk",
  APPSIGNAL_LOG: "log",
  APPSIGNAL_LOG_LEVEL: "logLevel",
  APPSIGNAL_LOG_PATH: "logPath",
  APPSIGNAL_LOGGING_ENDPOINT: "loggingEndpoint",
  APPSIGNAL_NGINX_PORT: "nginxPort",
  APPSIGNAL_OPENTELEMETRY_PORT: "opentelemetryPort",
  APPSIGNAL_PUSH_API_ENDPOINT: "endpoint",
  APPSIGNAL_PUSH_API_KEY: "pushApiKey",
  APPSIGNAL_REQUEST_HEADERS: "requestHeaders",
  APPSIGNAL_RUNNING_IN_CONTAINER: "runningInContainer",
  APPSIGNAL_SEND_ENVIRONMENT_METADATA: "sendEnvironmentMetadata",
  APPSIGNAL_SEND_PARAMS: "sendParams",
  APPSIGNAL_SEND_SESSION_DATA: "sendSessionData",
  APPSIGNAL_STATSD_PORT: "statsdPort",
  APPSIGNAL_WORKING_DIRECTORY_PATH: "workingDirectoryPath",
  APP_REVISION: "revision"
} satisfies Record<string, keyof AppsignalOptions>

/** @internal */
export const PRIVATE_ENV_MAPPING: Record<string, keyof AppsignalOptions> = {
  _APPSIGNAL_ACTIVE: "active",
  _APPSIGNAL_APP_ENV: "environment",
  _APPSIGNAL_APP_NAME: "name",
  _APPSIGNAL_BIND_ADDRESS: "bindAddress",
  _APPSIGNAL_CA_FILE_PATH: "caFilePath",
  _APPSIGNAL_CPU_COUNT: "cpuCount",
  _APPSIGNAL_DNS_SERVERS: "dnsServers",
  _APPSIGNAL_ENABLE_HOST_METRICS: "enableHostMetrics",
  _APPSIGNAL_ENABLE_OPENTELEMETRY_HTTP: "enableOpentelemetryHttp",
  _APPSIGNAL_ENABLE_STATSD: "enableStatsd",
  _APPSIGNAL_ENABLE_NGINX_METRICS: "enableNginxMetrics",
  _APPSIGNAL_FILES_WORLD_ACCESSIBLE: "filesWorldAccessible",
  _APPSIGNAL_FILTER_PARAMETERS: "filterParameters",
  _APPSIGNAL_FILTER_SESSION_DATA: "filterSessionData",
  _APPSIGNAL_HOSTNAME: "hostname",
  _APPSIGNAL_HOST_ROLE: "hostRole",
  _APPSIGNAL_HTTP_PROXY: "httpProxy",
  _APPSIGNAL_IGNORE_ACTIONS: "ignoreActions",
  _APPSIGNAL_IGNORE_ERRORS: "ignoreErrors",
  _APPSIGNAL_IGNORE_LOGS: "ignoreLogs",
  _APPSIGNAL_IGNORE_NAMESPACES: "ignoreNamespaces",
  _APPSIGNAL_LOG: "log",
  _APPSIGNAL_LOG_LEVEL: "logLevel",
  _APPSIGNAL_LOGGING_ENDPOINT: "loggingEndpoint",
  _APPSIGNAL_NGINX_PORT: "nginxPort",
  _APPSIGNAL_OPENTELEMETRY_PORT: "opentelemetryPort",
  _APPSIGNAL_PUSH_API_ENDPOINT: "endpoint",
  _APPSIGNAL_PUSH_API_KEY: "pushApiKey",
  _APPSIGNAL_RUNNING_IN_CONTAINER: "runningInContainer",
  _APPSIGNAL_SEND_ENVIRONMENT_METADATA: "sendEnvironmentMetadata",
  _APPSIGNAL_SEND_PARAMS: "sendParams",
  _APPSIGNAL_SEND_SESSION_DATA: "sendSessionData",
  _APPSIGNAL_STATSD_PORT: "statsdPort",
  _APPSIGNAL_WORKING_DIRECTORY_PATH: "workingDirectoryPath",
  _APP_REVISION: "revision"
}

/** @internal */
export const JS_TO_RUBY_MAPPING: Record<keyof AppsignalOptions, string> = {
  active: "active",
  bindAddress: "bind_address",
  pushApiKey: "push_api_key",
  caFilePath: "ca_file_path",
  cpuCount: "cpu_count",
  disableDefaultInstrumentations: "disable_default_instrumentations",
  dnsServers: "dns_servers",
  enableHostMetrics: "enable_host_metrics",
  enableOpentelemetryHttp: "enable_opentelemetry_http",
  enableMinutelyProbes: "enable_minutely_probes",
  enableStatsd: "enable_statsd",
  enableNginxMetrics: "enable_nginx_metrics",
  endpoint: "endpoint",
  environment: "env",
  filesWorldAccessible: "files_world_accessible",
  filterParameters: "filter_parameters",
  filterSessionData: "filter_session_data",
  hostname: "hostname",
  hostRole: "host_role",
  httpProxy: "http_proxy",
  ignoreActions: "ignore_actions",
  ignoreErrors: "ignore_errors",
  ignoreLogs: "ignore_logs",
  ignoreNamespaces: "ignore_namespaces",
  initializeOpentelemetrySdk: "initialize_opentelemetry_sdk",
  log: "log",
  logLevel: "log_level",
  logPath: "log_path",
  loggingEndpoint: "logging_endpoint",
  name: "name",
  nginxPort: "nginx_port",
  opentelemetryPort: "opentelemetry_port",
  requestHeaders: "request_headers",
  revision: "revision",
  runningInContainer: "running_in_container",
  sendEnvironmentMetadata: "send_environment_metadata",
  sendParams: "send_params",
  sendSessionData: "send_session_data",
  statsdPort: "statsd_port",
  workingDirectoryPath: "working_directory_path"
}

/** @internal */
export const BOOL_KEYS: (keyof typeof ENV_TO_KEY_MAPPING)[] = [
  "APPSIGNAL_ACTIVE",
  "APPSIGNAL_ENABLE_HOST_METRICS",
  "APPSIGNAL_ENABLE_OPENTELEMETRY_HTTP",
  "APPSIGNAL_ENABLE_MINUTELY_PROBES",
  "APPSIGNAL_ENABLE_STATSD",
  "APPSIGNAL_ENABLE_NGINX_METRICS",
  "APPSIGNAL_FILES_WORLD_ACCESSIBLE",
  "APPSIGNAL_RUNNING_IN_CONTAINER",
  "APPSIGNAL_SEND_ENVIRONMENT_METADATA",
  "APPSIGNAL_SEND_PARAMS",
  "APPSIGNAL_SEND_SESSION_DATA"
]

/** @internal */
export const STRING_KEYS: (keyof typeof ENV_TO_KEY_MAPPING)[] = [
  "APPSIGNAL_APP_ENV",
  "APPSIGNAL_APP_NAME",
  "APPSIGNAL_BIND_ADDRESS",
  "APPSIGNAL_CA_FILE_PATH",
  "APPSIGNAL_HOSTNAME",
  "APPSIGNAL_HOST_ROLE",
  "APPSIGNAL_HTTP_PROXY",
  "APPSIGNAL_INITIALIZE_OPENTELEMETRY_SDK",
  "APPSIGNAL_LOG",
  "APPSIGNAL_LOG_LEVEL",
  "APPSIGNAL_LOG_PATH",
  "APPSIGNAL_LOGGING_ENDPOINT",
  "APPSIGNAL_NGINX_PORT",
  "APPSIGNAL_OPENTELEMETRY_PORT",
  "APPSIGNAL_PUSH_API_ENDPOINT",
  "APPSIGNAL_PUSH_API_KEY",
  "APPSIGNAL_STATSD_PORT",
  "APPSIGNAL_WORKING_DIRECTORY_PATH",
  "APP_REVISION"
]

/** @internal */
export const LIST_KEYS: (keyof typeof ENV_TO_KEY_MAPPING)[] = [
  "APPSIGNAL_DNS_SERVERS",
  "APPSIGNAL_FILTER_PARAMETERS",
  "APPSIGNAL_FILTER_SESSION_DATA",
  "APPSIGNAL_IGNORE_ACTIONS",
  "APPSIGNAL_IGNORE_ERRORS",
  "APPSIGNAL_IGNORE_LOGS",
  "APPSIGNAL_IGNORE_NAMESPACES",
  "APPSIGNAL_REQUEST_HEADERS"
]

/** @internal */
export const LIST_OR_BOOL_KEYS: (keyof typeof ENV_TO_KEY_MAPPING)[] = [
  "APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS"
]

/** @internal */
export const FLOAT_KEYS: (keyof typeof ENV_TO_KEY_MAPPING)[] = [
  "APPSIGNAL_CPU_COUNT"
]

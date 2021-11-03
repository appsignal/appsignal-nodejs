export const ENV_TO_KEY_MAPPING: { [key: string]: string } = {
  APPSIGNAL_ACTIVE: "active",
  APPSIGNAL_APP_ENV: "environment",
  APPSIGNAL_APP_NAME: "name",
  APPSIGNAL_CA_FILE_PATH: "caFilePath",
  APPSIGNAL_DEBUG: "debug",
  APPSIGNAL_DNS_SERVERS: "dnsServers",
  APPSIGNAL_ENABLE_HOST_METRICS: "enableHostMetrics",
  APPSIGNAL_ENABLE_MINUTELY_PROBES: "enableMinutelyProbes",
  APPSIGNAL_ENABLE_STATSD: "enableStatsd",
  APPSIGNAL_FILES_WORLD_ACCESSIBLE: "filesWorldAccessible",
  APPSIGNAL_FILTER_DATA_KEYS: "filterDataKeys",
  APPSIGNAL_FILTER_PARAMETERS: "filterParameters",
  APPSIGNAL_FILTER_SESSION_DATA: "filterSessionData",
  APPSIGNAL_HOSTNAME: "hostname",
  APPSIGNAL_HTTP_PROXY: "httpProxy",
  APPSIGNAL_IGNORE_ACTIONS: "ignoreActions",
  APPSIGNAL_IGNORE_ERRORS: "ignoreErrors",
  APPSIGNAL_IGNORE_NAMESPACES: "ignoreNamespaces",
  APPSIGNAL_LOG: "log",
  APPSIGNAL_LOG_PATH: "logPath",
  APPSIGNAL_PUSH_API_ENDPOINT: "endpoint",
  APPSIGNAL_PUSH_API_KEY: "apiKey",
  APPSIGNAL_REQUEST_HEADERS: "requestHeaders",
  APPSIGNAL_RUNNING_IN_CONTAINER: "runningInContainer",
  APPSIGNAL_SEND_PARAMS: "sendParams",
  APPSIGNAL_SKIP_SESSION_DATA: "skipSessionData",
  APPSIGNAL_TRANSACTION_DEBUG_MODE: "transactionDebugMode",
  APPSIGNAL_WORKING_DIRECTORY_PATH: "workingDirectoryPath",
  APPSIGNAL_WORKING_DIR_PATH: "workingDirPath",
  APP_REVISION: "revision"
}

export const PRIVATE_ENV_MAPPING: { [key: string]: string } = {
  _APPSIGNAL_ACTIVE: "active",
  _APPSIGNAL_APP_NAME: "name",
  _APPSIGNAL_CA_FILE_PATH: "caFilePath",
  _APPSIGNAL_DEBUG_LOGGING: "debug",
  _APPSIGNAL_DNS_SERVERS: "dnsServers",
  _APPSIGNAL_ENABLE_HOST_METRICS: "enableHostMetrics",
  _APPSIGNAL_ENABLE_STATSD: "enableStatsd",
  _APPSIGNAL_ENVIRONMENT: "environment",
  _APPSIGNAL_FILES_WORLD_ACCESSIBLE: "filesWorldAccessible",
  _APPSIGNAL_FILTER_DATA_KEYS: "filterDataKeys",
  _APPSIGNAL_HOSTNAME: "hostname",
  _APPSIGNAL_HTTP_PROXY: "httpProxy",
  _APPSIGNAL_IGNORE_ACTIONS: "ignoreActions",
  _APPSIGNAL_IGNORE_ERRORS: "ignoreErrors",
  _APPSIGNAL_IGNORE_NAMESPACES: "ignoreNamespaces",
  _APPSIGNAL_LOG: "log",
  _APPSIGNAL_LOG_FILE_PATH: "logFilePath",
  _APPSIGNAL_PUSH_API_ENDPOINT: "endpoint",
  _APPSIGNAL_PUSH_API_KEY: "apiKey",
  _APPSIGNAL_RUNNING_IN_CONTAINER: "runningInContainer",
  _APPSIGNAL_TRANSACTION_DEBUG_MODE: "debug",
  _APPSIGNAL_WORKING_DIRECTORY_PATH: "workingDirectoryPath",
  _APPSIGNAL_WORKING_DIR_PATH: "workingDirPath",
  _APP_REVISION: "revision"
}

export const JS_TO_RUBY_MAPPING: { [key: string]: string } = {
  active: "active",
  apiKey: "push_api_key",
  caFilePath: "ca_file_path",
  debug: "debug",
  dnsServers: "dns_servers",
  enableHostMetrics: "enable_host_metrics",
  enableMinutelyProbes: "enable_minutely_probes",
  enableStatsd: "enable_statsd",
  endpoint: "endpoint",
  environment: "env",
  filesWorldAccessible: "files_world_accessible",
  filterDataKeys: "filter_data_keys",
  filterParameters: "filter_parameters",
  filterSessionData: "filter_session_data",
  hostname: "hostname",
  ignoreActions: "ignore_actions",
  ignoreErrors: "ignore_errors",
  ignoreNamespaces: "ignore_namespaces",
  log: "log",
  logPath: "log_path",
  logFilePath: "log_file_path",
  name: "name",
  revision: "revision",
  runningInContainer: "running_in_container",
  transactionDebugMode: "transaction_debug_mode",
  workingDirPath: "working_dir_path",
  workingDirectoryPath: "working_directory_path"
}

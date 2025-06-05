import path from "path"
import fs from "fs"

import { VERSION } from "../version"
import { Configuration } from "../config"
import {
  ENV_TO_KEY_MAPPING,
  BOOL_KEYS,
  FLOAT_KEYS,
  LIST_KEYS,
  LIST_OR_BOOL_KEYS,
  STRING_KEYS
} from "../config/configmap"

describe("Configuration", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"

  let config: Configuration
  let initialEnv: { [key: string]: any }

  const expectedDefaultConfig = {
    active: false,
    caFilePath: path.join(__dirname, "../../cert/cacert.pem"),
    disableDefaultInstrumentations: false,
    dnsServers: [],
    enableHostMetrics: true,
    enableOpentelemetryHttp: true,
    enableMinutelyProbes: true,
    enableStatsd: false,
    enableNginxMetrics: false,
    endpoint: "https://push.appsignal.com",
    environment: process.env.NODE_ENV || "development",
    filesWorldAccessible: true,
    filterParameters: [],
    filterSessionData: [],
    ignoreActions: [],
    ignoreErrors: [],
    ignoreLogs: [],
    ignoreNamespaces: [],
    initializeOpentelemetrySdk: true,
    log: "file",
    loggingEndpoint: "https://appsignal-endpoint.net",
    opentelemetryPort: "8099",
    requestHeaders: [
      "accept",
      "accept-charset",
      "accept-encoding",
      "accept-language",
      "cache-control",
      "connection",
      "content-length",
      "range"
    ],
    sendEnvironmentMetadata: true,
    sendParams: true,
    sendSessionData: true
  }

  function resetEnv() {
    Object.keys(process.env).forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(initialEnv, key)) {
        delete process.env[key]
      }
    })
  }

  function env(key: string): string | undefined {
    return process.env[key]
  }

  beforeAll(() => {
    initialEnv = Object.assign({}, process.env)
  })

  afterAll(() => {
    resetEnv()
  })

  beforeEach(() => {
    jest.resetModules()
    resetEnv()
  })

  it("knows how to transform all environment variables into options", () => {
    const allKeys = Object.keys(ENV_TO_KEY_MAPPING).sort()

    const allKeyTransformations = [
      BOOL_KEYS,
      STRING_KEYS,
      LIST_KEYS,
      LIST_OR_BOOL_KEYS,
      FLOAT_KEYS
    ]
      .flat()
      .sort()

    expect(allKeys).toEqual(allKeyTransformations)
  })

  describe("with only default options", () => {
    it("loads all default options", () => {
      config = new Configuration({})

      expect(config.data).toEqual(expectedDefaultConfig)

      expect(config.sources.default).toEqual(expectedDefaultConfig)
      expect(config.sources.system).toEqual({})
      expect(config.sources.initial).toEqual({})
      expect(config.sources.env).toEqual({})
    })
  })

  describe("system values", () => {
    it("sets log output to stdout on Heroku", () => {
      process.env.DYNO = "web.1"
      const systemConfig = { log: "stdout" }
      config = new Configuration({})
      delete process.env.DYNO

      expect(config.data).toEqual({ ...expectedDefaultConfig, ...systemConfig })

      expect(config.sources.default).toEqual(expectedDefaultConfig)
      expect(config.sources.system).toEqual(systemConfig)
      expect(config.sources.initial).toEqual({})
      expect(config.sources.env).toEqual({})
    })
  })

  describe("with initial config options", () => {
    it("loads initial config options", () => {
      const initialOptions = {
        enableStatsd: true
      }
      const options = {
        ...expectedDefaultConfig,
        ...initialOptions
      }
      config = new Configuration({
        ...initialOptions
      })

      expect(config.data).toEqual(options)

      expect(config.sources.default).toEqual(expectedDefaultConfig)
      expect(config.sources.system).toEqual({})
      expect(config.sources.initial).toEqual(initialOptions)
      expect(config.sources.env).toEqual({})
    })
  })

  describe("with config in the environment", () => {
    it("loads configuration from the environment", () => {
      process.env["APPSIGNAL_ENABLE_STATSD"] = "true"
      process.env["APPSIGNAL_ENABLE_HOST_METRICS"] = "false"
      process.env["APPSIGNAL_DNS_SERVERS"] = "8.8.8.8,8.8.4.4"
      process.env["APPSIGNAL_CPU_COUNT"] = "1.5"
      process.env["APPSIGNAL_NGINX_PORT"] = "8080"

      const envOptions = {
        enableStatsd: true,
        enableHostMetrics: false,
        dnsServers: ["8.8.8.8", "8.8.4.4"],
        cpuCount: 1.5,
        nginxPort: "8080"
      }

      const expectedConfig = {
        ...expectedDefaultConfig,
        ...envOptions
      }
      config = new Configuration({})

      expect(config.data).toEqual(expectedConfig)

      expect(config.sources.default).toEqual(expectedDefaultConfig)
      expect(config.sources.system).toEqual({})
      expect(config.sources.initial).toEqual({})
      expect(config.sources.env).toEqual(envOptions)
    })

    describe("with a list as APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS", () => {
      it("sets disableDefaultInstrumentations to the list", () => {
        process.env["APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS"] =
          "@opentelemetry/instrumentation-express,@opentelemetry/instrumentation-fastify,@opentelemetry/instrumentation-fs"
        const envOptions = {
          disableDefaultInstrumentations: [
            "@opentelemetry/instrumentation-express",
            "@opentelemetry/instrumentation-fastify",
            "@opentelemetry/instrumentation-fs"
          ]
        }
        const expectedConfig = {
          ...expectedDefaultConfig,
          ...envOptions
        }
        config = new Configuration({})

        expect(config.data).toEqual(expectedConfig)
      })
    })

    describe("with APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS set to true", () => {
      it("sets disableDefaultInstrumentations to true", () => {
        process.env["APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS"] = "true"
        const envOptions = {
          disableDefaultInstrumentations: true
        }
        const expectedConfig = {
          ...expectedDefaultConfig,
          ...envOptions
        }
        config = new Configuration({})

        expect(config.data).toEqual(expectedConfig)
      })
    })

    describe("with APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS set to false", () => {
      it("sets disableDefaultInstrumentations to false", () => {
        process.env["APPSIGNAL_DISABLE_DEFAULT_INSTRUMENTATIONS"] = "false"
        const envOptions = {
          disableDefaultInstrumentations: false
        }
        const expectedConfig = {
          ...expectedDefaultConfig,
          ...envOptions
        }
        config = new Configuration({})

        expect(config.data).toEqual(expectedConfig)
      })
    })
  })

  describe("logFilePath", () => {
    it("uses the default log file path", () => {
      jest.spyOn(fs, "accessSync").mockImplementation(() => {})
      config = new Configuration({ name, pushApiKey })

      expect(config.logFilePath).toEqual("/tmp/appsignal.log")
    })

    describe("with logPath option", () => {
      it("uses the configured path", () => {
        config = new Configuration({ logPath: "/other_path" })
        jest.spyOn(fs, "accessSync").mockImplementation(() => {})

        jest.spyOn(fs, "accessSync").mockImplementation(() => {})
        expect(config.logFilePath).toEqual("/other_path/appsignal.log")
      })

      describe("when the logPath directory can't be written to", () => {
        it("uses the system tmp dir", () => {
          jest.spyOn(fs, "accessSync").mockImplementation(path => {
            if (path === "/foo_dir") {
              throw "Error"
            } else {
              return true
            }
          })
          const warnMock = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {})

          config = new Configuration({ logPath: "/foo_dir" })

          expect(warnMock).toHaveBeenLastCalledWith(
            `Unable to log to '/foo_dir'. Logging to '/tmp' instead. Please check the permissions of the 'logPath' directory.`
          )
          expect(config.logFilePath).toEqual("/tmp/appsignal.log")
        })

        it("return undefined if the system tmp dir can't be written to", () => {
          jest.spyOn(fs, "accessSync").mockImplementation(() => {
            throw "Error"
          })
          const warnMock = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {})

          config = new Configuration({ logPath: "/foo_dir" })

          expect(warnMock).toHaveBeenLastCalledWith(
            `Unable to log to '/foo_dir' or '/tmp' fallback. Please check the permissions of these directories.`
          )
          expect(config.logFilePath).toBeUndefined()
        })
      })
    })

    describe("with logPath option with file specified", () => {
      it("uses the overwritten path but changes the file name", () => {
        jest.spyOn(fs, "accessSync").mockImplementation(() => {})

        const warnMock = jest
          .spyOn(console, "warn")
          .mockImplementation(() => {})
        config = new Configuration({ logPath: "/other_path/foo.log" })

        expect(warnMock).toHaveBeenLastCalledWith(
          "DEPRECATED: File names are no longer supported in the 'logPath' config option. Changing the filename to 'appsignal.log'"
        )
        // Test backwards compatibility with previous behaviour
        expect(config.logFilePath).toEqual("/other_path/appsignal.log")
      })
    })
  })

  describe("clientFilePath", () => {
    describe("when the client file exists in the root path", () => {
      it("returns the path to the client file", () => {
        jest.spyOn(fs, "existsSync").mockImplementation(givenPath => {
          return givenPath === path.join(process.cwd(), "appsignal.cjs")
        })

        expect(Configuration.clientFilePath).toEqual(
          path.join(process.cwd(), "appsignal.cjs")
        )
      })
    })

    describe("when the client file exists in the src path", () => {
      it("returns the path to the client file", () => {
        jest.spyOn(fs, "existsSync").mockImplementation(givenPath => {
          return givenPath === path.join(process.cwd(), "src", "appsignal.cjs")
        })

        expect(Configuration.clientFilePath).toEqual(
          path.join(process.cwd(), "src", "appsignal.cjs")
        )
      })
    })

    describe("when the client file does not exist", () => {
      it("returns undefined", () => {
        expect(Configuration.clientFilePath).toBeUndefined()
      })
    })
  })

  describe("private environment variables", () => {
    beforeEach(() => {
      new Configuration({})
    })

    it("writes default configuration values to the environment", () => {
      expect(env("_APPSIGNAL_ACTIVE")).toEqual("false")
      expect(env("_APPSIGNAL_APP_ENV")).toBeDefined()
      expect(env("_APPSIGNAL_APP_NAME")).toBeUndefined()
      expect(env("_APPSIGNAL_BIND_ADDRESS")).toBeUndefined()
      expect(env("_APPSIGNAL_CA_FILE_PATH")).toMatch(/cert\/cacert\.pem$/)
      expect(env("_APPSIGNAL_CPU_COUNT")).toBeUndefined()
      expect(env("_APPSIGNAL_DNS_SERVERS")).toBeUndefined()
      expect(env("_APPSIGNAL_ENABLE_HOST_METRICS")).toEqual("true")
      expect(env("_APPSIGNAL_ENABLE_OPENTELEMETRY_HTTP")).toEqual("true")
      expect(env("_APPSIGNAL_ENABLE_STATSD")).toEqual("false")
      expect(env("_APPSIGNAL_ENABLE_NGINX_METRICS")).toEqual("false")
      expect(env("_APPSIGNAL_FILES_WORLD_ACCESSIBLE")).toEqual("true")
      expect(env("_APPSIGNAL_FILTER_DATA_KEYS")).toBeUndefined()
      expect(env("_APPSIGNAL_HOSTNAME")).toBeUndefined()
      expect(env("_APPSIGNAL_HOST_ROLE")).toBeUndefined()
      expect(env("_APPSIGNAL_HTTP_PROXY")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_ACTIONS")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_ERRORS")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_LOGS")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_NAMESPACES")).toBeUndefined()
      expect(env("_APPSIGNAL_LOG")).toEqual("file")
      expect(env("_APPSIGNAL_LOG_LEVEL")).toBeUndefined()
      expect(env("_APPSIGNAL_LOG_FILE_PATH")).toEqual("/tmp/appsignal.log")
      expect(env("_APPSIGNAL_LOGGING_ENDPOINT")).toEqual(
        "https://appsignal-endpoint.net"
      )
      expect(env("_APPSIGNAL_OPENTELEMETRY_PORT")).toEqual("8099")
      expect(env("_APPSIGNAL_PUSH_API_ENDPOINT")).toEqual(
        "https://push.appsignal.com"
      )
      expect(env("_APPSIGNAL_PUSH_API_KEY")).toBeUndefined()
      expect(env("_APPSIGNAL_RUNNING_IN_CONTAINER")).toBeUndefined()
      expect(env("_APPSIGNAL_STATSD_PORT")).toBeUndefined()
      expect(env("_APPSIGNAL_WORKING_DIRECTORY_PATH")).toBeUndefined()
      expect(env("_APPSIGNAL_WORKING_DIR_PATH")).toBeUndefined()
      expect(env("_APP_REVISION")).toBeUndefined()
    })

    it("writes private constants to the environment", () => {
      expect(env("_APPSIGNAL_AGENT_PATH")).toMatch(/\/ext$/)
      expect(env("_APPSIGNAL_PROCESS_NAME")).toMatch(/node$/)
      expect(env("_APPSIGNAL_LANGUAGE_INTEGRATION_VERSION")).toEqual(
        `nodejs-${VERSION}`
      )
      expect(env("_APPSIGNAL_APP_PATH")).toEqual(process.cwd())
    })

    describe("with config options set to non-default values", () => {
      beforeEach(() => {
        jest.spyOn(fs, "accessSync").mockImplementation(() => {})

        new Configuration({
          name,
          active: true,
          bindAddress: "0.0.0.0",
          cpuCount: 1.5,
          pushApiKey,
          dnsServers: ["8.8.8.8", "8.8.4.4"],
          enableHostMetrics: false,
          enableOpentelemetryHttp: false,
          enableMinutelyProbes: false,
          enableStatsd: true,
          enableNginxMetrics: true,
          filesWorldAccessible: true,
          filterParameters: ["password", "confirm_password"],
          filterSessionData: ["key1", "key2"],
          hostname: "MyHostName",
          hostRole: "host role",
          httpProxy: "http://localhost",
          ignoreActions: ["MyAction", "MyOtherAction"],
          ignoreErrors: ["MyError", "MyOtherError"],
          ignoreLogs: ["^start$", "^Completed 2.* in .*ms$"],
          ignoreNamespaces: ["MyNamespace", "MyOtherNamespace"],
          logLevel: "debug",
          logPath: "/tmp/other",
          opentelemetryPort: "8082",
          runningInContainer: true,
          workingDirectoryPath: "/my/path",
          revision: "my-revision",
          statsdPort: "3000",
          nginxPort: "8080"
        })
      })

      it("writes configuration values to the environment", () => {
        expect(env("_APPSIGNAL_ACTIVE")).toEqual("true")
        expect(env("_APPSIGNAL_APP_NAME")).toEqual(name)
        expect(env("_APPSIGNAL_BIND_ADDRESS")).toEqual("0.0.0.0")
        expect(env("_APPSIGNAL_CPU_COUNT")).toEqual("1.5")
        expect(env("_APPSIGNAL_DNS_SERVERS")).toEqual("8.8.8.8,8.8.4.4")
        expect(env("_APPSIGNAL_ENABLE_HOST_METRICS")).toEqual("false")
        expect(env("_APPSIGNAL_ENABLE_OPENTELEMETRY_HTTP")).toEqual("false")
        expect(env("_APPSIGNAL_ENABLE_STATSD")).toEqual("true")
        expect(env("_APPSIGNAL_ENABLE_NGINX_METRICS")).toEqual("true")
        expect(env("_APPSIGNAL_FILES_WORLD_ACCESSIBLE")).toEqual("true")
        expect(env("_APPSIGNAL_FILTER_PARAMETERS")).toEqual(
          "password,confirm_password"
        )
        expect(env("_APPSIGNAL_FILTER_SESSION_DATA")).toEqual("key1,key2")
        expect(env("_APPSIGNAL_HOSTNAME")).toEqual("MyHostName")
        expect(env("_APPSIGNAL_HOST_ROLE")).toEqual("host role")
        expect(env("_APPSIGNAL_HTTP_PROXY")).toEqual("http://localhost")
        expect(env("_APPSIGNAL_IGNORE_ACTIONS")).toEqual(
          "MyAction,MyOtherAction"
        )
        expect(env("_APPSIGNAL_IGNORE_ERRORS")).toEqual("MyError,MyOtherError")
        expect(env("_APPSIGNAL_IGNORE_LOGS")).toEqual(
          "^start$,^Completed 2.* in .*ms$"
        )
        expect(env("_APPSIGNAL_IGNORE_NAMESPACES")).toEqual(
          "MyNamespace,MyOtherNamespace"
        )
        expect(env("_APPSIGNAL_LOG")).toEqual("file")
        expect(env("_APPSIGNAL_LOG_LEVEL")).toEqual("debug")
        expect(env("_APPSIGNAL_LOG_FILE_PATH")).toEqual(
          path.join("/tmp/other", "appsignal.log")
        )
        expect(env("_APPSIGNAL_LOGGING_ENDPOINT")).toEqual(
          "https://appsignal-endpoint.net"
        )
        expect(env("_APPSIGNAL_OPENTELEMETRY_PORT")).toEqual("8082")
        expect(env("_APPSIGNAL_PUSH_API_ENDPOINT")).toEqual(
          "https://push.appsignal.com"
        )
        expect(env("_APPSIGNAL_PUSH_API_KEY")).toEqual(pushApiKey)
        expect(env("_APPSIGNAL_RUNNING_IN_CONTAINER")).toEqual("true")
        expect(env("_APPSIGNAL_SEND_ENVIRONMENT_METADATA")).toEqual("true")
        expect(env("_APPSIGNAL_STATSD_PORT")).toEqual("3000")
        expect(env("_APPSIGNAL_WORKING_DIRECTORY_PATH")).toEqual("/my/path")
        expect(env("_APPSIGNAL_WORKING_DIR_PATH")).toBeUndefined()
        expect(env("_APP_REVISION")).toEqual("my-revision")
        expect(env("_APPSIGNAL_NGINX_PORT")).toEqual("8080")
      })
    })
  })

  describe(".validationError", () => {
    it("is valid if pushApiKey is present and active is not false", () => {
      config = new Configuration({ pushApiKey: "something", active: true })
      expect(config.validationError()).toBeFalsy()
    })

    it("is invalid if pushApiKey is not present", () => {
      config = new Configuration({ active: true })
      expect(config.validationError()).toEqual("Push API key is not present")
    })

    it("is invalid if pushApiKey is an empty string", () => {
      config = new Configuration({ pushApiKey: "", active: true })
      expect(config.validationError()).toEqual("Push API key is not present")
    })

    it("is invalid if pushApiKey is a string with only whitespaces", () => {
      config = new Configuration({ pushApiKey: "  ", active: true })
      expect(config.validationError()).toEqual("Push API key is not present")
    })

    it("is invalid if active is false", () => {
      config = new Configuration({ pushApiKey: "something", active: false })
      expect(config.validationError()).toEqual("AppSignal is not active")
    })
  })
})

import path from "path"
import fs from "fs"

import { VERSION } from "../version"
import { Configuration } from "../config"

describe("Configuration", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"

  let config: Configuration
  let initialEnv: { [key: string]: any }

  const expectedDefaultConfig = {
    active: false,
    caFilePath: path.join(__dirname, "../../cert/cacert.pem"),
    debug: false,
    disableDefaultInstrumentations: false,
    dnsServers: [],
    enableHostMetrics: true,
    enableMinutelyProbes: true,
    enableStatsd: false,
    endpoint: "https://push.appsignal.com",
    environment: process.env.NODE_ENV || "development",
    filesWorldAccessible: true,
    filterParameters: [],
    filterSessionData: [],
    ignoreActions: [],
    ignoreErrors: [],
    ignoreNamespaces: [],
    log: "file",
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
    sendSessionData: true,
    transactionDebugMode: false
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
        debug: true,
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
      process.env["APPSIGNAL_DEBUG"] = "true"
      process.env["APPSIGNAL_ENABLE_STATSD"] = "true"
      const envOptions = {
        debug: true,
        enableStatsd: true
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
  })

  describe("apiKey option", () => {
    it("sets the pushApiKey config option with the apiKey value", () => {
      const warnMock = jest.spyOn(console, "warn").mockImplementation(() => {})
      const apiKey = "my key"
      config = new Configuration({ apiKey })

      expect(config.data.pushApiKey).toEqual(apiKey)
      expect(config.data.apiKey).toBeUndefined()
      expect(config.sources.initial.pushApiKey).toEqual(apiKey)
      expect(config.sources.initial.apiKey).toBeUndefined()
      expect(warnMock).toBeCalledWith(
        "DEPRECATED: The `apiKey` config option was renamed to `pushApiKey`. Please rename the config option given to the Appsignal module."
      )
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

  describe("private environment variables", () => {
    beforeEach(() => {
      new Configuration({})
    })

    it("writes default configuration values to the environment", () => {
      expect(env("_APPSIGNAL_ACTIVE")).toBeUndefined()
      expect(env("_APPSIGNAL_APP_NAME")).toBeUndefined()
      expect(env("_APPSIGNAL_CA_FILE_PATH")).toMatch(/cert\/cacert\.pem$/)
      expect(env("_APPSIGNAL_DEBUG_LOGGING")).toBeUndefined()
      expect(env("_APPSIGNAL_DNS_SERVERS")).toBeUndefined()
      expect(env("_APPSIGNAL_ENABLE_HOST_METRICS")).toEqual("true")
      expect(env("_APPSIGNAL_ENABLE_STATSD")).toBeUndefined()
      expect(env("_APPSIGNAL_ENVIRONMENT")).toBeDefined()
      expect(env("_APPSIGNAL_FILES_WORLD_ACCESSIBLE")).toEqual("true")
      expect(env("_APPSIGNAL_FILTER_DATA_KEYS")).toBeUndefined()
      expect(env("_APPSIGNAL_HOSTNAME")).toBeUndefined()
      expect(env("_APPSIGNAL_HTTP_PROXY")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_ACTIONS")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_ERRORS")).toBeUndefined()
      expect(env("_APPSIGNAL_IGNORE_NAMESPACES")).toBeUndefined()
      expect(env("_APPSIGNAL_LOG")).toEqual("file")
      expect(env("_APPSIGNAL_LOG_LEVEL")).toBeUndefined()
      expect(env("_APPSIGNAL_LOG_FILE_PATH")).toEqual("/tmp/appsignal.log")
      expect(env("_APPSIGNAL_PUSH_API_ENDPOINT")).toEqual(
        "https://push.appsignal.com"
      )
      expect(env("_APPSIGNAL_PUSH_API_KEY")).toBeUndefined()
      expect(env("_APPSIGNAL_RUNNING_IN_CONTAINER")).toBeUndefined()
      expect(env("_APPSIGNAL_TRANSACTION_DEBUG_MODE")).toBeUndefined()
      expect(env("_APPSIGNAL_WORKING_DIRECTORY_PATH")).toBeUndefined()
      expect(env("_APPSIGNAL_WORKING_DIR_PATH")).toBeUndefined()
      expect(env("_APP_REVISION")).toBeUndefined()
    })

    it("writes private constants to the environment", () => {
      expect(env("_APPSIGNAL_AGENT_PATH")).toMatch(/nodejs\/ext$/)
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
          pushApiKey,
          debug: true,
          dnsServers: ["8.8.8.8", "8.8.4.4"],
          enableHostMetrics: false,
          enableMinutelyProbes: false,
          enableStatsd: true,
          filesWorldAccessible: true,
          filterParameters: ["password", "confirm_password"],
          filterSessionData: ["key1", "key2"],
          hostname: "MyHostName",
          httpProxy: "http://localhost",
          ignoreActions: ["MyAction", "MyOtherAction"],
          ignoreErrors: ["MyError", "MyOtherError"],
          ignoreNamespaces: ["MyNamespace", "MyOtherNamespace"],
          logLevel: "debug",
          logPath: "/tmp/other",
          runningInContainer: true,
          workingDirectoryPath: "/my/path",
          revision: "my-revision"
        })
      })

      it("writes configuration values to the environment", () => {
        expect(env("_APPSIGNAL_ACTIVE")).toEqual("true")
        expect(env("_APPSIGNAL_APP_NAME")).toEqual(name)
        expect(env("_APPSIGNAL_DEBUG_LOGGING")).toEqual("true")
        expect(env("_APPSIGNAL_DNS_SERVERS")).toEqual("8.8.8.8,8.8.4.4")
        expect(env("_APPSIGNAL_ENABLE_HOST_METRICS")).toEqual("true")
        expect(env("_APPSIGNAL_ENABLE_STATSD")).toEqual("true")
        expect(env("_APPSIGNAL_FILES_WORLD_ACCESSIBLE")).toEqual("true")
        expect(env("_APPSIGNAL_FILTER_PARAMETERS")).toEqual(
          "password,confirm_password"
        )
        expect(env("_APPSIGNAL_FILTER_SESSION_DATA")).toEqual("key1,key2")
        expect(env("_APPSIGNAL_HOSTNAME")).toEqual("MyHostName")
        expect(env("_APPSIGNAL_HTTP_PROXY")).toEqual("http://localhost")
        expect(env("_APPSIGNAL_IGNORE_ACTIONS")).toEqual(
          "MyAction,MyOtherAction"
        )
        expect(env("_APPSIGNAL_IGNORE_ERRORS")).toEqual("MyError,MyOtherError")
        expect(env("_APPSIGNAL_IGNORE_NAMESPACES")).toEqual(
          "MyNamespace,MyOtherNamespace"
        )
        expect(env("_APPSIGNAL_LOG")).toEqual("file")
        expect(env("_APPSIGNAL_LOG_LEVEL")).toEqual("debug")
        expect(env("_APPSIGNAL_LOG_FILE_PATH")).toEqual(
          path.join("/tmp/other", "appsignal.log")
        )
        expect(env("_APPSIGNAL_PUSH_API_ENDPOINT")).toEqual(
          "https://push.appsignal.com"
        )
        expect(env("_APPSIGNAL_PUSH_API_KEY")).toEqual(pushApiKey)
        expect(env("_APPSIGNAL_RUNNING_IN_CONTAINER")).toEqual("true")
        expect(env("_APPSIGNAL_SEND_ENVIRONMENT_METADATA")).toEqual("true")
        // Only set because `debug` is set to true
        // @TODO: https://github.com/appsignal/appsignal-nodejs/issues/379
        expect(env("_APPSIGNAL_TRANSACTION_DEBUG_MODE")).toEqual("true")
        expect(env("_APPSIGNAL_WORKING_DIRECTORY_PATH")).toEqual("/my/path")
        expect(env("_APPSIGNAL_WORKING_DIR_PATH")).toBeUndefined()
        expect(env("_APP_REVISION")).toEqual("my-revision")
      })
    })
  })

  describe(".isValid", () => {
    it("is valid if pushApiKey is present", () => {
      config = new Configuration({ pushApiKey })
      expect(config.isValid).toBeTruthy()
    })

    it("is invalid if pushApiKey is not present", () => {
      config = new Configuration({ name })
      expect(config.isValid).toBeFalsy()
    })

    it("is invalid if pushApiKey is an empty string", () => {
      config = new Configuration({ name, pushApiKey: "" })
      expect(config.isValid).toBeFalsy()
    })

    it("is invalid if pushApiKey is a string with only whitespaces", () => {
      config = new Configuration({ name, pushApiKey: "  " })
      expect(config.isValid).toBeFalsy()
    })
  })
})

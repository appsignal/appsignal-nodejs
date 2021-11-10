import path from "path"
import { VERSION } from "../version"
import { Configuration } from "../config"

describe("Configuration", () => {
  const name = "TEST APP"
  const apiKey = "TEST_API_KEY"

  let config: Configuration
  let initialEnv: { [key: string]: any }

  function resetEnv() {
    Object.keys(process.env).forEach(key => {
      if (!initialEnv.hasOwnProperty(key)) {
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

  describe("Default options", () => {
    const expectedDefaultConfig = {
      caFilePath: path.join(__dirname, "../../cert/cacert.pem"),
      debug: false,
      dnsServers: [],
      enableHostMetrics: true,
      enableMinutelyProbes: true,
      enableStatsd: false,
      endpoint: "https://push.appsignal.com",
      environment: process.env.NODE_ENV || "development",
      filesWorldAccessible: true,
      filterDataKeys: [],
      filterParameters: [],
      filterSessionData: [],
      ignoreActions: [],
      ignoreErrors: [],
      ignoreNamespaces: [],
      log: "file",
      logPath: "/tmp",
      transactionDebugMode: false
    }

    const expectedInitialConfig = {
      name,
      apiKey
    }

    const expectedConfig = {
      ...expectedDefaultConfig,
      ...expectedInitialConfig
    }

    it("loads all default options when no options are overwritten", () => {
      config = new Configuration({ name, apiKey })

      expect(config.data).toEqual(expectedConfig)

      expect(config.sources.default).toEqual(expectedDefaultConfig)
      expect(config.sources.initial).toEqual(expectedInitialConfig)
      expect(config.sources.env).toEqual({})
    })

    describe("overwrites default values", () => {
      const overwrittenConfig = {
        debug: true,
        enableStatsd: true
      }

      const expectedConfig = {
        ...expectedDefaultConfig,
        ...overwrittenConfig
      }

      it("with initial values", () => {
        config = new Configuration({
          ...overwrittenConfig
        })

        expect(config.data).toEqual(expectedConfig)

        expect(config.sources.default).toEqual(expectedDefaultConfig)
        expect(config.sources.initial).toEqual(overwrittenConfig)
        expect(config.sources.env).toEqual({})
      })

      it("with environment values", () => {
        process.env["APPSIGNAL_DEBUG"] = "true"
        process.env["APPSIGNAL_ENABLE_STATSD"] = "true"

        config = new Configuration({})

        expect(config.data).toEqual(expectedConfig)

        expect(config.sources.default).toEqual(expectedDefaultConfig)
        expect(config.sources.initial).toEqual({})
        expect(config.sources.env).toEqual(overwrittenConfig)
      })
    })
  })

  describe("with config in the environment", () => {
    it("loads configuration from the environment", () => {
      process.env["APPSIGNAL_ACTIVE"] = "true"

      new Configuration({ name, apiKey })
      expect(env("_APPSIGNAL_ACTIVE")).toBeTruthy()
    })
  })

  describe("logFilePath", () => {
    it("uses the default log file path", () => {
      config = new Configuration({ name, apiKey })

      expect(config.logFilePath).toEqual("/tmp/appsignal.log")
    })

    describe("with logPath option", () => {
      beforeEach(() => {
        config = new Configuration({ logPath: "/other_path" })
      })

      it("uses the overwritten path", () => {
        expect(config.logFilePath).toEqual("/other_path/appsignal.log")
      })
    })

    describe("with logPath option with file specified", () => {
      beforeEach(() => {
        config = new Configuration({ logPath: "/other_path/appsignal.log" })
      })

      it("uses the overwritten path", () => {
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
      expect(env("_APPSIGNAL_AGENT_PATH")).toMatch(/nodejs-ext\/ext$/)
      expect(env("_APPSIGNAL_PROCESS_NAME")).toEqual("node")
      expect(env("_APPSIGNAL_LANGUAGE_INTEGRATION_VERSION")).toEqual(
        `nodejs-${VERSION}`
      )
      expect(env("_APPSIGNAL_APP_PATH")).toEqual(process.cwd())
    })

    describe("with config options set to non-default values", () => {
      beforeEach(() => {
        new Configuration({
          name,
          active: true,
          apiKey,
          debug: true,
          dnsServers: ["8.8.8.8", "8.8.4.4"],
          enableHostMetrics: false,
          enableMinutelyProbes: false,
          enableStatsd: true,
          filesWorldAccessible: true,
          filterDataKeys: ["password", "confirm_password"],
          hostname: "MyHostName",
          httpProxy: "http://localhost",
          ignoreActions: ["MyAction", "MyOtherAction"],
          ignoreErrors: ["MyError", "MyOtherError"],
          ignoreNamespaces: ["MyNamespace", "MyOtherNamespace"],
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
        expect(env("_APPSIGNAL_FILTER_DATA_KEYS")).toEqual(
          "password,confirm_password"
        )
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
        expect(env("_APPSIGNAL_LOG_FILE_PATH")).toEqual(
          path.join("/tmp/other", "appsignal.log")
        )
        expect(env("_APPSIGNAL_PUSH_API_ENDPOINT")).toEqual(
          "https://push.appsignal.com"
        )
        expect(env("_APPSIGNAL_PUSH_API_KEY")).toEqual(apiKey)
        expect(env("_APPSIGNAL_RUNNING_IN_CONTAINER")).toEqual("true")
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
    it("is valid if apiKey is present", () => {
      config = new Configuration({ apiKey })
      expect(config.isValid).toBeTruthy()
    })

    it("is invalid if apiKey is not present", () => {
      config = new Configuration({ name })
      expect(config.isValid).toBeFalsy()
    })

    it("is invalid if apiKey is an empty string", () => {
      config = new Configuration({ name, apiKey: "" })
      expect(config.isValid).toBeFalsy()
    })

    it("is invalid if apiKey is a string with only whitespaces", () => {
      config = new Configuration({ name, apiKey: "  " })
      expect(config.isValid).toBeFalsy()
    })
  })
})

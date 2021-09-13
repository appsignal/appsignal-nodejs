import { Configuration } from "../config"

describe("Configuration", () => {
  const name = "TEST APP"
  const apiKey = "TEST_API_KEY"

  let config: Configuration

  beforeEach(() => {
    jest.resetModules()
    config = new Configuration({ name, apiKey })
  })

  it("writes key and name to the environment", () => {
    expect(process.env["_APPSIGNAL_APP_NAME"]).toEqual(name)
    expect(process.env["_APPSIGNAL_PUSH_API_KEY"]).toEqual(apiKey)
  })

  it("writes private constants to the environment", () => {
    expect(process.env["_APPSIGNAL_AGENT_PATH"]).toBeDefined()
    expect(process.env["_APPSIGNAL_ENVIRONMENT"]).toBeDefined()
    expect(process.env["_APPSIGNAL_PROCESS_NAME"]).toBeDefined()
    expect(process.env["_APPSIGNAL_LANGUAGE_INTEGRATION_VERSION"]).toBeDefined()
    expect(process.env["_APPSIGNAL_APP_PATH"]).toBeDefined()
  })

  it("recognises a valid configuration", () => {
    expect(config.isValid).toBeTruthy()
  })

  it("loads configuration from the environment", () => {
    process.env["APPSIGNAL_ACTIVE"] = "true"

    config = new Configuration({ name, apiKey })
    expect(process.env["_APPSIGNAL_ACTIVE"]).toBeTruthy()
  })

  it("uses a default log file path", () => {
    expect(process.env["_APPSIGNAL_LOG_FILE_PATH"]).toEqual(
      "/tmp/appsignal.log"
    )
  })

  describe("Overriden log path with file specified", () => {
    beforeEach(() => {
      process.env["APPSIGNAL_LOG_PATH"] = "/other_path/appsignal.log"
      config = new Configuration({ name, apiKey })
    })

    it("uses the overwritten path", () => {
      // Test backwards compatibility with previous behaviour
      expect(process.env["_APPSIGNAL_LOG_FILE_PATH"]).toEqual(
        "/other_path/appsignal.log"
      )
    })
  })

  describe("Overriden log path", () => {
    beforeEach(() => {
      process.env["APPSIGNAL_LOG_PATH"] = "/other_path"
      config = new Configuration({ name, apiKey })
    })

    it("uses the overwritten path", () => {
      expect(process.env["_APPSIGNAL_LOG_FILE_PATH"]).toEqual(
        "/other_path/appsignal.log"
      )
    })
  })
})

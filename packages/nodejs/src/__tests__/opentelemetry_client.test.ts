import { OpenTelemetryClient as Client } from "../opentelemetry_client"

jest.mock("../bootstrap", () => {
  return {
    initCorePlugins: jest.fn(() => {}),
    initCoreProbes: jest.fn(() => {})
  }
})

import { initCorePlugins } from "../bootstrap"

describe("OpenTelemetryClient", () => {
  const name = "TEST APP"
  const pushApiKey = "TEST_API_KEY"
  const DEFAULT_OPTS = { name, pushApiKey }
  let client: Client

  beforeEach(() => {
    client = new Client({ ...DEFAULT_OPTS })
  })

  afterEach(() => {
    client.stop()
  })

  it("does not activate auto instrumention", () => {
    client.start()
    expect(initCorePlugins).toHaveBeenCalledWith(expect.anything(), {
      instrumentationConfig: {
        http: false,
        https: false,
        redis: false,
        pg: false
      }
    })
  })
})

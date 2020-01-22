import { Client } from "../client"
import { Tracer } from "../tracer"

jest.mock("../tracer")

describe("Client", () => {
  const name = "TEST APP"
  const apiKey = "TEST_API_KEY"

  let client: Client

  beforeEach(() => {
    client = new Client({ name, apiKey })
  })

  it("starts the client", () => {
    client.start()
    expect(client.isActive).toBeTruthy()
  })

  it("stops the client", () => {
    client.stop()
    expect(client.isActive).toBeFalsy()
  })

  it("starts the client when the active option is true", () => {
    client = new Client({ name, apiKey, active: true })
    expect(client.isActive).toBeTruthy()
  })

  it("doesn't return a tracer if the agent isn't started", () => {
    const tracer = client.tracer()
    expect(tracer).toBeUndefined()
  })

  it("returns a tracer if the agent is started", () => {
    client = new Client({ name, apiKey, active: true })
    const tracer = client.tracer()
    expect(tracer).toBeDefined()
  })
})

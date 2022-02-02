import { Transmitter } from "../transmitter"
import nock from "nock"
import https from "https"
import fs from "fs"
import { ClientRequest, IncomingMessage } from "http"

describe("Transmitter", () => {
  let originalEnv: any = undefined

  beforeEach(() => {
    if (!nock.isActive()) {
      nock.activate()
    }

    nock.disableNetConnect()

    originalEnv = { ...process.env }
  })

  afterEach(() => {
    jest.clearAllMocks()

    process.env = originalEnv
  })

  afterAll(() => {
    nock.restore()
  })

  describe(".transmit", () => {
    function sampleTransmitter(): Transmitter {
      return new Transmitter("https://example.com/foo", "request body")
    }

    function mockSampleRequest(responseBody: object | string, query = {}) {
      nock("https://example.com")
        .post("/foo", "request body")
        .query({
          api_key: "",
          name: "",
          environment: "test",
          hostname: "",
          ...query
        })
        .reply(200, responseBody)
    }

    async function expectResponse(
      response: Promise<any>,
      expectedBody: object
    ) {
      await expect(response).resolves.toEqual({
        status: 200,
        body: expectedBody
      })
    }

    function mockHTTPSRequest() {
      return jest.spyOn(https, "request").mockImplementation(() => {
        const clientRequestMock = {
          on: () => {},
          write: () => {},
          end: () => {}
        }

        return (clientRequestMock as unknown) as ClientRequest
      })
    }

    it("resolves to a response on success", async () => {
      const transmitter = sampleTransmitter()

      mockSampleRequest({ json: "response" })

      await expectResponse(transmitter.transmit(), { json: "response" })
    })

    it("resolves to an empty object if the response is not JSON", async () => {
      const transmitter = sampleTransmitter()

      mockSampleRequest("not JSON")

      await expectResponse(transmitter.transmit(), {})
    })

    it("rejects on error", async () => {
      const transmitter = sampleTransmitter()

      // do not mock the request -- beforeEach uses nock to disable network
      // requests, so any request to a non-mocked host will throw an error

      await expect(transmitter.transmit()).rejects.toMatchObject({
        error: expect.any(Error)
      })
    })

    it("uses config values in the query string", async () => {
      process.env.APPSIGNAL_PUSH_API_KEY = "some_api_key"
      process.env.APPSIGNAL_APP_NAME = "myApp"
      ;(process.env as any).NODE_ENV = "development"
      process.env.APPSIGNAL_HOSTNAME = "myHostname"

      const transmitter = sampleTransmitter()

      mockSampleRequest(
        {},
        {
          api_key: "some_api_key",
          name: "myApp",
          environment: "development",
          hostname: "myHostname"
        }
      )

      await expectResponse(transmitter.transmit(), {})
    })

    it("uses the CA file from the config", async () => {
      // disable nock, so we can mock the https library ourselves
      nock.restore()

      process.env.APPSIGNAL_CA_FILE_PATH = "/foo/bar"

      jest.spyOn(fs, "accessSync").mockImplementation(() => {})

      const fsReadFileSyncMock = jest
        .spyOn(fs, "readFileSync")
        .mockImplementation(() => "ca file contents")

      const httpsRequestMock = mockHTTPSRequest()

      sampleTransmitter().transmit()

      expect(fsReadFileSyncMock).toHaveBeenCalledWith("/foo/bar", "utf-8")

      expect(httpsRequestMock).toHaveBeenCalledWith(
        expect.objectContaining({ ca: "ca file contents" }),
        expect.anything()
      )
    })

    it("doesn't configure the CA if the CA file is not readable", () => {
      // disable nock, so we can mock the https library ourselves
      nock.restore()

      process.env.APPSIGNAL_CA_FILE_PATH = "/foo/bar"

      jest.spyOn(fs, "accessSync").mockImplementation(path => {
        if (path == "/foo/bar") {
          throw new Error("No CA for you!")
        }
      })

      const consoleWarnSpy = jest.spyOn(console, "warn")

      const httpsRequestMock = mockHTTPSRequest()

      sampleTransmitter().transmit()

      expect(httpsRequestMock).toHaveBeenCalledWith(
        expect.not.objectContaining({ ca: expect.anything() }),
        expect.anything()
      )

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Provided caFilePath: '/foo/bar' is not readable."
      )
    })
  })
})

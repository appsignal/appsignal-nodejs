import { Transmitter } from "../transmitter"
import nock from "nock"
import https from "https"
import fs from "fs"
import http, { ClientRequest } from "http"
import { HashMap } from "@appsignal/types"
import { URLSearchParams } from "url"
import { EventEmitter } from "events"

describe("Transmitter", () => {
  let originalEnv: any = undefined

  beforeEach(() => {
    if (!nock.isActive()) {
      nock.activate()
    }

    nock.cleanAll()
    nock.disableNetConnect()

    originalEnv = { ...process.env }
  })

  afterEach(() => {
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
  })

  describe(".downloadStream", () => {
    const transmitter = new Transmitter("http://example.com/foo")

    it("resolves to a response stream on success", async () => {
      nock("http://example.com").get("/foo").reply(200, "response body")

      const stream = await transmitter.downloadStream()

      await expect(
        new Promise(resolve => {
          stream.on("data", resolve)
        })
      ).resolves.toEqual(Buffer.from("response body"))
    })

    it("rejects if the status code is not successful", async () => {
      nock("http://example.com").get("/foo").reply(404, "not found")

      await expect(transmitter.downloadStream()).rejects.toMatchObject({
        kind: "statusCode",
        statusCode: 404
      })
    })

    it("rejects if there's a request error", async () => {
      // do not mock the request -- beforeEach uses nock to disable network
      // requests, so any request to a non-mocked host will throw an error

      await expect(transmitter.downloadStream()).rejects.toMatchObject({
        kind: "requestError",
        error: expect.any(Error)
      })
    })
  })

  describe(".request", () => {
    function mockRequest(module: typeof http | typeof https) {
      const requestCallbacks = {
        on: jest.fn(),
        write: jest.fn(),
        end: jest.fn()
      }

      // casting the spy to `any` because the type system gets
      // confused about the expected `mockImplementation` signature
      const spy: any = jest.spyOn(module, "request")

      const mock = spy.mockImplementation(
        (_options: any, callback: (stream: any) => void) => {
          const stream = new EventEmitter()
          callback(stream)
          stream.emit("end")

          return requestCallbacks as unknown as ClientRequest
        }
      )

      return mock
    }

    function transmitterRequest(
      method: string,
      url: string,
      body?: string,
      params = new URLSearchParams()
    ) {
      return new Promise<HashMap<jest.Mock>>(resolve => {
        const callbacks: HashMap<jest.Mock> = {
          callback: jest.fn(stream => {
            stream.on("data", callbacks.onData)
            stream.on("end", () => resolve(callbacks))
          }),

          onData: jest.fn(),
          onError: jest.fn(() => resolve(callbacks))
        }

        const transmitter = new Transmitter(url, body)

        transmitter.request({
          method,
          params,
          callback: callbacks.callback,
          onError: callbacks.onError
        })
      })
    }

    it("performs an HTTP GET request", async () => {
      nock("http://example.invalid").get("/foo").reply(200, "response body")

      const { callback, onData, onError } = await transmitterRequest(
        "GET",
        "http://example.invalid/foo"
      )

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 200 })
      )

      expect(onData).toHaveBeenCalledWith(Buffer.from("response body"))
      expect(onError).not.toHaveBeenCalled()
    })

    it("performs an HTTP POST request", async () => {
      nock("http://example.invalid")
        .post("/foo", "request body")
        .reply(200, "response body")

      const { callback, onData, onError } = await transmitterRequest(
        "POST",
        "http://example.invalid/foo",
        "request body"
      )

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 200 })
      )

      expect(onData).toHaveBeenCalledWith(Buffer.from("response body"))
      expect(onError).not.toHaveBeenCalled()
    })

    it("performs an HTTP request with query parameters", async () => {
      nock("http://example.invalid")
        .get("/foo")
        .query({ bar: "baz" })
        .reply(200, "response body")

      const { callback, onData, onError } = await transmitterRequest(
        "GET",
        "http://example.invalid/foo",
        undefined,
        new URLSearchParams({ bar: "baz" })
      )

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 200 })
      )

      expect(onData).toHaveBeenCalledWith(Buffer.from("response body"))
      expect(onError).not.toHaveBeenCalled()
    })

    it("listens to errors on the request", async () => {
      // do not mock the request -- beforeEach uses nock to disable network
      // requests, so any request to a non-mocked host will throw an error

      const { callback, onData, onError } = await transmitterRequest(
        "GET",
        "http://example.invalid/foo"
      )

      expect(onError).toHaveBeenCalledWith(expect.any(Error))
      expect(onData).not.toHaveBeenCalled()
      expect(callback).not.toHaveBeenCalled()
    })

    it("follows redirects", async () => {
      nock("http://example.invalid")
        .get("/301")
        .reply(301, undefined, {
          Location: "http://example.invalid/302"
        })
        .get("/302")
        .reply(302, undefined, {
          Location: "http://example.invalid/303"
        })
        .get("/303")
        .reply(303, undefined, {
          Location: "http://example.invalid/307"
        })
        .get("/307")
        .reply(307, undefined, {
          Location: "http://example.invalid/308"
        })
        .get("/308")
        .reply(308, undefined, {
          Location: "http://example.invalid/foo"
        })
        .get("/foo")
        .reply(200, "response body")

      const { callback, onData, onError } = await transmitterRequest(
        "GET",
        "http://example.invalid/301"
      )

      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({ statusCode: 200 })
      )
      expect(callback).toHaveBeenCalledTimes(1)

      expect(onData).toHaveBeenCalledWith(Buffer.from("response body"))
      expect(onError).not.toHaveBeenCalled()
    })

    it("redirects to GET method for status code 301/302/303", async () => {
      nock("http://example.invalid")
        .post("/301", "request body")
        .reply(301, undefined, {
          Location: "http://example.invalid/foo"
        })
        .post("/302", "request body")
        .reply(302, undefined, {
          Location: "http://example.invalid/foo"
        })
        .post("/303", "request body")
        .reply(303, undefined, {
          Location: "http://example.invalid/foo"
        })
        .get("/foo")
        .times(3)
        .reply(200, "response body")

      for (const statusCode of [301, 302, 303]) {
        const { callback, onData, onError } = await transmitterRequest(
          "POST",
          `http://example.invalid/${statusCode}`,
          "request body"
        )

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ statusCode: 200 })
        )

        expect(onData).toHaveBeenCalledWith(Buffer.from("response body"))
        expect(onError).not.toHaveBeenCalled()
      }
    })

    it("redirects to the same method for status code 307/308", async () => {
      nock("http://example.invalid")
        .post("/307", "request body")
        .reply(307, undefined, {
          Location: "http://example.invalid/foo"
        })
        .post("/308", "request body")
        .reply(308, undefined, {
          Location: "http://example.invalid/foo"
        })
        .post("/foo", "request body")
        .times(2)
        .reply(200, "response body")

      for (const statusCode of [307, 308]) {
        const { callback, onData, onError } = await transmitterRequest(
          "POST",
          `http://example.invalid/${statusCode}`,
          "request body"
        )

        expect(callback).toHaveBeenCalledWith(
          expect.objectContaining({ statusCode: 200 })
        )

        expect(onData).toHaveBeenCalledWith(Buffer.from("response body"))
        expect(onError).not.toHaveBeenCalled()
      }
    })

    it("throws an error on a redirect loop", async () => {
      nock("http://example.invalid")
        .persist()
        .get("/foo")
        .reply(302, undefined, {
          Location: "http://example.invalid/bar"
        })
        .get("/bar")
        .reply(302, undefined, {
          Location: "http://example.invalid/foo"
        })

      const { callback, onData, onError } = await transmitterRequest(
        "GET",
        `http://example.invalid/foo`
      )

      expect(callback).not.toHaveBeenCalled()
      expect(onData).not.toHaveBeenCalled()
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "MaxRedirectsError",
          message: "Maximum number of redirects reached"
        })
      )
    })

    it("uses the CA file from the config", async () => {
      // disable nock, so we can mock the https library ourselves
      nock.restore()

      process.env.APPSIGNAL_CA_FILE_PATH = "/foo/bar"

      jest.spyOn(fs, "accessSync").mockImplementation(() => {})

      const fsReadFileSyncMock = jest
        .spyOn(fs, "readFileSync")
        .mockImplementation(() => "ca file contents")

      const mock = mockRequest(https)

      await transmitterRequest("GET", "https://example.invalid")

      expect(fsReadFileSyncMock).toHaveBeenCalledWith("/foo/bar", "utf-8")

      expect(mock).toHaveBeenCalledWith(
        expect.objectContaining({ ca: "ca file contents" }),
        expect.any(Function)
      )
    })

    it("doesn't configure the CA if the CA file is not readable", async () => {
      // disable nock, so we can mock the https library ourselves
      nock.restore()

      process.env.APPSIGNAL_CA_FILE_PATH = "/foo/bar"

      jest.spyOn(fs, "accessSync").mockImplementation(path => {
        if (path == "/foo/bar") {
          throw new Error("No CA for you!")
        }
      })

      const consoleWarnMock = jest
        .spyOn(console, "warn")
        .mockImplementationOnce(() => {})

      const mock = mockRequest(https)

      await transmitterRequest("GET", "https://example.invalid")

      expect(mock).toHaveBeenCalledWith(
        expect.not.objectContaining({ ca: expect.anything() }),
        expect.any(Function)
      )

      expect(consoleWarnMock).toHaveBeenCalledTimes(1)
      expect(consoleWarnMock).toHaveBeenCalledWith(
        "Provided caFilePath: '/foo/bar' is not readable."
      )
    })

    it("doesn't configure the CA if the request is not HTTPS", async () => {
      // disable nock, so we can mock the https library ourselves
      nock.restore()

      const httpMock = mockRequest(http)
      const httpsMock = mockRequest(https)

      await transmitterRequest("GET", "http://example.invalid")

      expect(httpsMock).not.toHaveBeenCalled()
      expect(httpMock).toHaveBeenCalledWith(
        expect.not.objectContaining({ ca: expect.anything() }),
        expect.any(Function)
      )
    })
  })
})

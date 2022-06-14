const fs = require("fs")
const { reportPath } = require("../report")
const { downloadFromMirror } = require("../extension")
const nock = require("nock")
const { Writable, EventEmitter } = require("stream")
const { AGENT_VERSION } = require("../support/constants")

describe("Extension install success", () => {
  test("writes success result to diagnose installation report", () => {
    const report = readReport()
    expect(report["result"]).toEqual({
      status: "success"
    })
  })
})

describe(".downloadFromMirror", () => {
  beforeAll(() => {
    if (!nock.isActive()) {
      nock.activate()
    }
    nock.disableNetConnect()
  })

  afterAll(() => {
    nock.restore()
  })

  function mockFsCreateWriteStream() {
    let buffer = Buffer.from("")

    const stream = new Writable({
      write(chunk, _encoding, callback) {
        buffer = Buffer.concat([buffer, chunk])
        callback()
      }
    })

    const mock = jest.spyOn(fs, "createWriteStream").mockImplementation(() => {
      process.nextTick(() => stream.emit("ready"))
      return stream
    })

    const output = new Promise(resolve => {
      stream.on("finish", () => resolve(buffer.toString()))
    })

    return { mock, output }
  }

  const mirror = "https://example.mirror"
  const filename = "agent-filename"
  const expectedURLPath = `/${AGENT_VERSION}/${filename}`
  const expectedURL = `${mirror}${expectedURLPath}`
  const outputPath = "/output/path"
  const fileContents = "agent-binary-contents"

  it("downloads the agent from the mirror to the output path", async () => {
    const { mock, output } = mockFsCreateWriteStream()

    nock(mirror).get(expectedURLPath).reply(200, fileContents)

    const downloadResult = downloadFromMirror(mirror, filename, outputPath)

    await expect(downloadResult).resolves.toEqual(expectedURL)

    expect(mock).toHaveBeenCalledWith(outputPath)
    await expect(output).resolves.toEqual(fileContents)
  })

  it("rejects the promise given a failure status code", async () => {
    const fsCreateWriteStreamSpy = jest.spyOn(fs, "createWriteStream")

    nock(mirror).get(expectedURLPath).reply(404, "Agent not found")

    const downloadResult = downloadFromMirror(mirror, filename, outputPath)

    await expect(downloadResult).rejects.toMatchObject({
      message: "Request to CDN failed with code HTTP 404",
      downloadUrl: expectedURL
    })

    expect(fsCreateWriteStreamSpy).not.toHaveBeenCalled()
  })

  it("rejects the promise if the connection fails", async () => {
    const fsCreateWriteStreamSpy = jest.spyOn(fs, "createWriteStream")

    // do not mock the request -- beforeAll uses nock to disable network
    // requests, so any request to a non-mocked host will throw an error

    const downloadResult = downloadFromMirror(mirror, filename, outputPath)

    await expect(downloadResult).rejects.toMatchObject({
      message: "Could not connect to CDN",
      downloadUrl: expectedURL
    })

    expect(fsCreateWriteStreamSpy).not.toHaveBeenCalled()
  })

  it("rejects the promise if the output path can't be written to", async () => {
    const fsCreateWriteStreamMock = jest
      .spyOn(fs, "createWriteStream")
      .mockImplementation(() => {
        const stream = new EventEmitter()
        process.nextTick(() => stream.emit("error"))
        return stream
      })

    nock(mirror).get(expectedURLPath).reply(200, fileContents)

    const downloadResult = downloadFromMirror(mirror, filename, outputPath)

    await expect(downloadResult).rejects.toMatchObject({
      message: `Could not download to output path ${outputPath}`
    })

    expect(fsCreateWriteStreamMock).toHaveBeenCalledWith(outputPath)
  })
})

function readReport() {
  const contents = fs.readFileSync(reportPath(), "utf-8")
  return JSON.parse(contents)
}

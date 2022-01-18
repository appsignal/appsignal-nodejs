import fs from "fs"
import { DiagnoseTool } from "../diagnose"
import { VERSION, AGENT_VERSION } from "../version"

describe("DiagnoseTool", () => {
  let tool: DiagnoseTool

  const fsAccessSpy = jest.spyOn(fs, "accessSync").mockImplementation(() => {})

  beforeEach(() => {
    tool = new DiagnoseTool()
    jest.clearAllMocks()
  })

  it("generates a configuration", async () => {
    const output = await tool.generate()

    expect(output.library.package_version).toEqual(VERSION)
    expect(output.library.agent_version).toEqual(AGENT_VERSION)

    expect(output.host.architecture).toEqual(process.arch)
    expect(output.host.os).toEqual(process.platform)

    expect(output.config.options).toHaveProperty("debug")
    expect(output.config.options).toHaveProperty("log")
    expect(output.config.options).toHaveProperty("caFilePath")
    expect(output.config.options).toHaveProperty("endpoint")
    expect(output.config.options).toHaveProperty("environment")

    expect(output.process.uid).toEqual(process.getuid())
  })

  describe("install report", () => {
    it("fetches the install report", async () => {
      const output = await tool.generate()

      const install = output.installation
      expect(install).not.toHaveProperty("parsing_error")
      expect(install).toHaveProperty("build")
      expect(install).toHaveProperty("download")
      expect(install).toHaveProperty("host")
      expect(install).toHaveProperty("language")
      expect(install).toHaveProperty("result")
    })

    it("returns an error report on failure to read the install report", async () => {
      const fsReadSpy = jest
        .spyOn(fs, "readFileSync")
        .mockImplementation(() => {
          throw new Error("uh oh")
        })
      const output = await tool.generate()

      const install = output.installation
      expect(install).toMatchObject({
        parsing_error: {
          error: expect.any(String),
          backtrace: expect.any(Array)
        }
      })
      expect(install).not.toHaveProperty("build")
      expect(install).not.toHaveProperty("download")
      expect(install).not.toHaveProperty("host")
      expect(install).not.toHaveProperty("language")
      expect(install).not.toHaveProperty("result")
    })

    it("returns an error report on failure to parse the install report", async () => {
      const fsReadSpy = jest
        .spyOn(fs, "readFileSync")
        .mockImplementation(() => "not JSON")
      const output = await tool.generate()

      const install = output.installation
      expect(install).toMatchObject({
        parsing_error: {
          error: expect.any(String),
          backtrace: expect.any(Array),
          raw: "not JSON"
        }
      })
      expect(install).not.toHaveProperty("build")
      expect(install).not.toHaveProperty("download")
      expect(install).not.toHaveProperty("host")
      expect(install).not.toHaveProperty("language")
      expect(install).not.toHaveProperty("result")
    })
  })

  it("returns the log_dir_path", async () => {
    const report = await tool.generate()
    expect(report.paths.log_dir_path.path).toEqual("/tmp")
  })

  describe("appsignal.log path", () => {
    it("returns the appsignal.log path", async () => {
      const report = await tool.generate()
      expect(report.paths["appsignal.log"].path).toEqual("/tmp/appsignal.log")
    })

    it("returns all of the file if file is less than 2MiB in size", async () => {
      const fileSize = 1.9 * 1024 * 1024 // Write 1.9 MiB of content
      const content = ".".repeat(fileSize)
      fs.writeFileSync("/tmp/appsignal.log", content, { flag: "w" })

      const report = await tool.generate()
      const contentArray = report.paths["appsignal.log"].content
      expect(contentArray?.join("\n").length).toBeCloseTo(fileSize, 0)
    })

    it("returns maximum 2MiB of content", async () => {
      const content = ".".repeat(2.1 * 1024 * 1024) // Write 2.1 MiB of content
      fs.writeFileSync("/tmp/appsignal.log", content, { flag: "w" })

      const report = await tool.generate()
      const contentArray = report.paths["appsignal.log"].content
      expect(contentArray?.join("\n").length).toEqual(2 * 1024 * 1024)
    })
  })

  describe("when to log path is configured as a full path", () => {
    beforeEach(() => {
      process.env["APPSIGNAL_LOG_PATH"] = "/path/to/appsignal.log"
      tool = new DiagnoseTool()
    })

    it("returns the log_dir_path", async () => {
      const report = await tool.generate()
      expect(report.paths.log_dir_path.path).toEqual("/path/to")
    })

    it("returns the appsignal.log path", async () => {
      const report = await tool.generate()
      expect(report.paths["appsignal.log"].path).toEqual(
        "/path/to/appsignal.log"
      )
    })
  })
})

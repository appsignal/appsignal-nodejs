import { DiagnoseTool } from "../diagnose"
import { VERSION, AGENT_VERSION } from "../version"

describe("DiagnoseTool", () => {
  let tool: DiagnoseTool

  beforeEach(() => {
    tool = new DiagnoseTool({})
  })

  it("generates a configuration", () => {
    const output = tool.generate()

    expect(output.library.package_version).toEqual(VERSION)
    expect(output.library.agent_version).toEqual(AGENT_VERSION)

    expect(output.host.architecture).toEqual(process.arch)
    expect(output.host.os).toEqual(process.platform)

    expect(output.config.options).toHaveProperty("debug")
    expect(output.config.options).toHaveProperty("log")
    expect(output.config.options).toHaveProperty("log_path")
    expect(output.config.options).toHaveProperty("ca_file_path")
    expect(output.config.options).toHaveProperty("endpoint")
    expect(output.config.options).toHaveProperty("env")

    expect(output.process.uid).toEqual(process.getuid())
  })

  it("returns the log_dir_path", () => {
    expect(tool.generate().paths.log_dir_path.path).toEqual("/tmp")
  })

  it("returns the appsignal.log path", () => {
    expect(tool.generate().paths["appsignal.log"].path).toEqual(
      "/tmp/appsignal.log"
    )
  })

  describe("when to log path is configured as a full path", () => {
    beforeEach(() => {
      process.env["APPSIGNAL_LOG_PATH"] = "/path/to/appsignal.log"
      tool = new DiagnoseTool({})
    })

    it("returns the log_dir_path", () => {
      expect(tool.generate().paths.log_dir_path.path).toEqual("/path/to")
    })

    it("returns the appsignal.log path", () => {
      expect(tool.generate().paths["appsignal.log"].path).toEqual(
        "/path/to/appsignal.log"
      )
    })
  })
})

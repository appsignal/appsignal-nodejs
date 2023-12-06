import fs from "fs"
import { Extension } from "../extension"
import {
  reportPath,
  processTarget
} from "../../scripts/extension/support/helpers"

describe("Extension", () => {
  let ext: Extension

  beforeEach(() => {
    ext = new Extension()
  })

  afterEach(() => {
    ext.stop()
  })

  it("logs an error when the module is required", () => {
    const errorSpy = jest.spyOn(console, "error")

    jest.resetModules()
    require("../extension")

    expect(errorSpy).toHaveBeenLastCalledWith(
      "[appsignal][ERROR] AppSignal failed to load the extension. Please run the diagnose tool and email us at support@appsignal.com: https://docs.appsignal.com/nodejs/3.x/command-line/diagnose.html\n",
      expect.any(Object)
    )
  })

  describe("when the install architecture doesn't match the current architecture", () => {
    let originalInstallReport: { [key: string]: object }

    beforeEach(() => {
      // Temporary write report with other target and architecture to deliberatly cause a mismatch
      originalInstallReport = readReport()
      const newReport = {
        ...originalInstallReport,
        build: {
          ...originalInstallReport["build"],
          target: "dummyTarget",
          architecture: "dummyArch"
        }
      }
      dumpReport(newReport)
    })

    afterEach(() => {
      // Restore original report so this dummy state doesn't leak into other tests or breaks the local install
      dumpReport(originalInstallReport)
    })

    it("logs an error with the installed and current architecture", () => {
      const errorSpy = jest.spyOn(console, "error")
      const target = processTarget()
      const arch = process.arch

      jest.resetModules()
      require("../extension")

      expect(errorSpy).toHaveBeenLastCalledWith(
        `[appsignal][ERROR] The AppSignal extension was installed for architecture 'dummyArch-dummyTarget', but the current architecture is '${arch}-${target}'. Please reinstall the AppSignal package on the host the app is started.`
      )
    })
  })

  describe("when the install report can't be read", () => {
    let originalInstallReport: { [key: string]: object }

    beforeEach(() => {
      // Remove the install report to cause a deliberate error
      originalInstallReport = readReport()
      fs.rmSync(reportPath())
    })

    afterEach(() => {
      // Restore original report so this dummy state doesn't leak into other tests or breaks the local install
      dumpReport(originalInstallReport)
    })

    it("logs an error about the missing install report", () => {
      const errorSpy = jest.spyOn(console, "error")

      jest.resetModules()
      require("../extension")

      expect(errorSpy).toHaveBeenCalledWith(
        "[appsignal][ERROR] Unable to fetch install report:",
        expect.any(Object)
      )
      expect(errorSpy).toHaveBeenLastCalledWith(
        "[appsignal][ERROR] AppSignal failed to load the extension. Please run the diagnose tool and email us at support@appsignal.com: https://docs.appsignal.com/nodejs/3.x/command-line/diagnose.html\n",
        expect.any(Object)
      )
    })
  })

  it("is not loaded", () => {
    expect(Extension.isLoaded).toEqual(false)
  })

  it("does not start the client", () => {
    expect(() => {
      ext.start()
    }).not.toThrow()
  })

  it("does not error on stopping the client", () => {
    expect(() => {
      ext.stop()
    }).not.toThrow()
  })

  it("does not error on diagnoseRaw", () => {
    expect(ext.diagnose()).toMatchObject({
      error: expect.any(Error),
      output: [""]
    })
  })

  it("does not error on runningInContainer", () => {
    expect(ext.runningInContainer()).toBeUndefined()
  })

  function readReport() {
    const rawReport = fs.readFileSync(reportPath(), "utf8")
    return JSON.parse(rawReport)
  }

  function dumpReport(report: object) {
    fs.writeFileSync(reportPath(), JSON.stringify(report, null, 2))
  }
})

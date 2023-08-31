const originalProcess = process
const originalProcessEnv = process.env
const mockHelpers = { spawnSync: jest.fn() }

jest.doMock("child_process", () => {
  const originalModule = jest.requireActual("child_process")
  return {
    ...originalModule,
    ...mockHelpers
  }
})

const { createBuildReport } = require("../report")

describe("muslOverride", () => {
  beforeEach(() => {
    // Make a copy of the process object so that it doesn't modify the original
    // objects.
    global.process = {
      ...originalProcess,
      env: { ...originalProcessEnv }
    }

    // Set defaults
    setHasMusl(false)
  })

  afterEach(() => {
    global.process = originalProcess
  })

  function setPlatform(platform) {
    global.process.platform = platform
  }

  function setEnv(key, value) {
    global.process.env[key] = value
  }

  function setHasMusl(value) {
    const stderr = value ? "musl libc (arch)" : "something else"
    mockHelpers.spawnSync.mockReturnValue({ stderr })
  }

  describe("with linux platform", () => {
    test("returns linux platform", () => {
      setPlatform("linux")
      setHasMusl(false)

      expect(createBuildReport({})).toMatchObject({
        target: "linux",
        musl_override: false
      })
    })

    describe("when on musl system", () => {
      test("returns linux-musl platform with musl_override === false", () => {
        setPlatform("linux")
        expect(process.env.APPSIGNAL_BUILD_FOR_MUSL).toBeUndefined()
        setHasMusl(true)

        expect(createBuildReport({})).toMatchObject({
          target: "linux-musl",
          musl_override: false
        })
      })
    })
  })

  describe("with darwin platform", () => {
    test("returns darwin platform", () => {
      setPlatform("darwin")

      expect(createBuildReport({})).toMatchObject({
        target: "darwin",
        musl_override: false
      })
    })
  })

  describe("with APPSIGNAL_BUILD_FOR_MUSL empty", () => {
    test("returns linux-musl platform with musl_override === false", () => {
      setPlatform("linux")
      setEnv("APPSIGNAL_BUILD_FOR_MUSL", "")

      expect(createBuildReport({})).toMatchObject({
        target: "linux",
        musl_override: false
      })
    })
  })

  describe("with APPSIGNAL_BUILD_FOR_MUSL=1", () => {
    test("returns linux-musl platform with musl_override === true", () => {
      setEnv("APPSIGNAL_BUILD_FOR_MUSL", "1")

      expect(createBuildReport({})).toMatchObject({
        target: "linux-musl",
        musl_override: true
      })
    })
  })

  describe("with APPSIGNAL_BUILD_FOR_MUSL=true", () => {
    test("returns linux-musl platform with musl_override === true", () => {
      setEnv("APPSIGNAL_BUILD_FOR_MUSL", "true")

      expect(createBuildReport({})).toMatchObject({
        target: "linux-musl",
        musl_override: true
      })
    })
  })

  describe("with APPSIGNAL_BUILD_FOR_LINUX_ARM empty", () => {
    test("returns host's platform and linux_arm_override === false", () => {
      setPlatform("linux")
      setEnv("APPSIGNAL_BUILD_FOR_LINUX_ARM", "")

      expect(createBuildReport({})).toMatchObject({
        architecture: process.arch, // Defaults to the host architecture
        target: "linux",
        linux_arm_override: false
      })
    })
  })

  describe("with APPSIGNAL_BUILD_FOR_LINUX_ARM=1", () => {
    test("returns arm64 linux platform and linux_arm_override === true", () => {
      setEnv("APPSIGNAL_BUILD_FOR_LINUX_ARM", "1")

      expect(createBuildReport({})).toMatchObject({
        architecture: "arm64",
        target: "linux",
        linux_arm_override: true
      })
    })
  })

  describe("with APPSIGNAL_BUILD_FOR_LINUX_ARM=true", () => {
    test("returns arm64 linux platform with linux_arm_override === true", () => {
      setEnv("APPSIGNAL_BUILD_FOR_LINUX_ARM", "true")

      expect(createBuildReport({})).toMatchObject({
        architecture: "arm64",
        target: "linux",
        linux_arm_override: true
      })
    })
  })
})

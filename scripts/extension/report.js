const path = require("path")

const { AGENT_VERSION } = require("./support/constants")
const { hasMusl } = require("./support/helpers")

function createReport() {
  return {
    result: { status: "incomplete" },
    language: {
      name: "nodejs",
      version: process.versions["node"],
      implementation: "nodejs"
    },
    download: {},
    build: {},
    host: {
      root_user: process.getuid && process.getuid() === 0,
      dependencies: {}
    }
  }
}

function muslOverride() {
  const musl = process.env["APPSIGNAL_BUILD_FOR_MUSL"]
  return musl === "true" || musl === "1"
}

function linuxArmOverride() {
  const arm = process.env["APPSIGNAL_BUILD_FOR_LINUX_ARM"]
  return arm === "true" || arm === "1"
}

function agentTarget() {
  if (linuxArmOverride()) {
    return "linux"
  }
  if (muslOverride()) {
    return "linux-musl"
  }

  const target = [process.platform]
  if (/linux/.test(target[0]) && hasMusl()) {
    target.push("-musl")
  }
  return target.join("")
}

function agentArchitecture() {
  if (linuxArmOverride()) {
    return "arm64"
  }
  return process.arch
}

function createBuildReport({ isLocalBuild = false }) {
  return {
    time: new Date().toISOString(),
    package_path: path.join(__dirname, "/../ext/"),
    architecture: agentArchitecture(),
    target: agentTarget(),
    musl_override: muslOverride(),
    linux_arm_override: linuxArmOverride(),
    library_type: "static",
    dependencies: {},
    flags: {},
    source: isLocalBuild ? "local" : "remote",
    agent_version: AGENT_VERSION
  }
}

function createDownloadReport(report) {
  return {
    checksum: "unverified",
    http_proxy: null,
    ...report
  }
}

// This implementation should match the `packages/nodejs/src/utils.ts`
// implementation to generate the same path.
function reportPath() {
  return path.join(__dirname, "../../ext/install.report")
}

module.exports = {
  createReport,
  createBuildReport,
  createDownloadReport,
  reportPath
}

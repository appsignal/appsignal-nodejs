const path = require("path")

const { AGENT_VERSION } = require("./extension/constants")
const { hasMusl } = require("./extension/helpers")

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
  return process.env["APPSIGNAL_BUILD_FOR_MUSL"] === "true"
}

function agentTarget() {
  if (muslOverride()) {
    return "linux-musl"
  }

  const target = [process.platform];
  if (target[0].test(/linux/) && hasMusl()) {
    target.push("-musl")
  }
  return target.join("")
}

function createBuildReport({ isLocalBuild = false }) {
  return {
    time: new Date().toISOString(),
    package_path: path.join(__dirname, "/../ext/"),
    architecture: process.arch,
    target: agentTarget(),
    musl_override: muslOverride(),
    library_type: "static",
    dependencies: {},
    flags: {},
    source: isLocalBuild ? "local" : "remote",
    agent_version: AGENT_VERSION
  }
}

function createDownloadReport({ verified = false, downloadUrl: download_url }) {
  return {
    checksum: verified ? "verified" : "unverified",
    http_proxy: null,
    download_url
  }
}

module.exports = {
  createReport,
  createBuildReport,
  createDownloadReport
}

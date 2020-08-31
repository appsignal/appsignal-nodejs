const path = require("path")

const { AGENT_VERSION } = require("./extension/constants")
const { hasMusl } = require("./extension/helpers")

function createReport({ status = false, isLocalBuild = false }) {
  return {
    result: { status },
    language: {
      name: "nodejs",
      version: process.versions["node"],
      implementation: "nodejs"
    },
    download: {
      checksum: "verified",
      http_proxy: null,
      download_url:
        "https://appsignal-agent-releases.global.ssl.fastly.net/c8f8185/appsignal-x86_64-darwin-all-static.tar.gz"
    },
    build: {
      time: new Date().toISOString(),
      package_path: path.join(__dirname, "/../ext/"),
      architecture: process.arch,
      target: process.platform,
      musl_override:
        process.env["APPSIGNAL_BUILD_FOR_MUSL"] === "true" || hasMusl(),
      library_type: "static",
      dependencies: {},
      flags: {},
      source: isLocalBuild ? "local" : "remote",
      agent_version: AGENT_VERSION
    },
    host: {
      rootUser: process.getuid && process.getuid() === 0,
      dependencies: {}
    }
  }
}

exports.createReport = createReport

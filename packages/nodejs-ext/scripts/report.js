const path = require("path")

function createReport() {
  return {
    language: {
      name: "nodejs",
      version: process.versions["node"]
    },
    build: {
      time: new Date().toISOString(),
      packagePath: path.join(__dirname, "/../ext/"),
      architecture: process.arch,
      target: process.platform,
      muslOverride: Boolean(process.env["APPSIGNAL_BUILD_FOR_MUSL"]),
      libraryType: "static"
    },
    host: {
      rootUser: process.getuid && process.getuid() === 0,
      dependencies: {}
    }
  }
}

exports.createReport = createReport

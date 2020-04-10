const path = require("path")
const fs = require("fs")

/**
 * Returns `true` if the /ext directory contains a local build. and vice versa
 *
 * @return  {boolean}
 */
function hasLocalBuild() {
  const filenames = ["appsignal-agent", "libappsignal.a", "appsignal.h"]

  return filenames.every(file =>
    fs.existsSync(path.join(__dirname, "/../../ext/", file))
  )
}

/**
 * Returns `true` if the current architecture is supported by the agent. and vice versa
 *
 * @param   {object}  report  A valid report object
 *
 * @return  {boolean}
 */
function hasSupportedArchitecture(report) {
  // 'x32' and 'x64' supported
  return (
    report.build.architecture === "x32" || report.build.architecture === "x64"
  )
}

/**
 * Returns `true` if the current linux system is using musl as its libc and vice versa
 *
 * @return  {boolean}
 */
function hasMusl() {
  return /musl/.test(child_process.spawnSync("ldd", ["--version"]).stderr);
}

module.exports = { hasLocalBuild, hasSupportedArchitecture, hasMusl }

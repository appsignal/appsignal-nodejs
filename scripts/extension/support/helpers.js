const path = require("path")
const fs = require("fs")
const child_process = require("child_process")

/**
 * Returns `true` if the /ext directory contains a local build.
 *
 * @return  {boolean}
 */
function hasLocalBuild() {
  const filenames = ["appsignal-agent", "libappsignal.a", "appsignal.h"]

  return filenames.every(file =>
    fs.existsSync(path.join(__dirname, "/../../../ext/", file))
  )
}

/**
 * Returns `true` if the given architecture is supported by the agent.
 *
 * @param   {string}  arch  The architecture
 *
 * @return  {boolean}
 */
function hasSupportedArchitecture(arch) {
  // 'x32' and 'x64' supported
  return arch === "x32" || arch === "x64" || arch === "arm64"
}

/**
 * Returns `true` if the given operating system is supported by the agent.
 *
 * @param   {string}  os  The operating system
 *
 * @return  {boolean}
 */
function hasSupportedOs(os) {
  return os === "darwin" || os === "freebsd" || os === "linux"
}

/**
 * Returns `true` if the current linux system is using musl as its libc.
 *
 * @return  {boolean}
 */
function hasMusl() {
  return /musl/.test(child_process.spawnSync("ldd", ["--version"]).stderr)
}

/**
 * Returns the target platform of the current process.
 *
 * @return  {string}
 */
function processTarget() {
  const target = [process.platform]
  if (/linux/.test(target[0]) && hasMusl()) {
    target.push("-musl")
  }
  return target.join("")
}

/**
 * Returns the filesystem path of the installation report.
 *
 * @return  {string}
 */
function reportPath() {
  return path.join(__dirname, "../../../ext/install.report")
}

module.exports = {
  hasLocalBuild,
  hasSupportedArchitecture,
  hasMusl,
  hasSupportedOs,
  processTarget,
  reportPath
}

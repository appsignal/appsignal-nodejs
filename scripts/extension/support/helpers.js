const path = require("path")
const fs = require("fs")
const child_process = require("child_process")

/**
 * Returns `true` if the /ext directory contains a local build. and vice versa
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
 * Returns `true` if the current architecture is supported by the agent. and vice versa
 *
 * @param   {object}  report  A valid report object
 *
 * @return  {boolean}
 */
function hasSupportedArchitecture(arch) {
  // 'x32' and 'x64' supported
  return arch === "x32" || arch === "x64" || arch === "arm64"
}

/**
 * Returns `true` if the current operating systrm is supported by the agent. and vice versa
 *
 * @param   {object}  report  A valid report object
 *
 * @return  {boolean}
 */
function hasSupportedOs(os) {
  return os === "darwin" || os === "freebsd" || os === "linux"
}

/**
 * Returns `true` if the current linux system is using musl as its libc and vice versa
 *
 * @return  {boolean}
 */
function hasMusl() {
  return /musl/.test(child_process.spawnSync("ldd", ["--version"]).stderr)
}

module.exports = {
  hasLocalBuild,
  hasSupportedArchitecture,
  hasMusl,
  hasSupportedOs
}

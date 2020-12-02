import path from "path"

/**
 * Retrieve a valid version number from a `package.json` in a given
 * `basedir`.
 *
 * @function
 */
export function getPackageVerson(basedir: string): string {
  try {
    const { version } = require(path.join(basedir, "package.json"))
    return version
  } catch (e) {
    return "0.0.0"
  }
}

/**
 * Given a valid POSIX `timestamp`, return an object containing a
 * representation if that timestamps in seconds and nanoseconds.
 *
 * @function
 */
export function getAgentTimestamps(timestamp: number) {
  return {
    sec: Math.round(timestamp / 1000), // seconds
    nsec: Math.round(timestamp * 1e6) // nanoseconds
  }
}

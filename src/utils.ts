import fs from "fs"
import perf_hooks from "perf_hooks"

const NANOSECOND_DIGITS = 9
const SECOND_TO_NANOSECONDS = Math.pow(10, NANOSECOND_DIGITS)

/**
 * Given a valid POSIX `timestamp` in milliseconds since the UNIX epoch,
 * return an object containing a representation if that timestamps in
 * seconds and nanoseconds.
 *
 * @function
 */
export function getAgentTimestamps(timestamp: number) {
  const sec = Math.round(timestamp / 1000)
  return {
    sec: sec, // seconds
    nsec: timestamp * 1e6 - sec * 1e9 // nanoseconds
  }
}

/**
 * Checks if the given path is writable by the process.
 */
export function isWritable(path: string) {
  try {
    fs.accessSync(path, fs.constants.W_OK)
    return true
  } catch (e) {
    return false
  }
}

/**
 * Returns a high-resolution time tuple containing the current time in seconds and nanoseconds.
 *
 * @function
 */
export function hrTime(performance = perf_hooks.performance): {
  sec: number
  nsec: number
} {
  const origin = numberToHrtime(performance.timeOrigin)
  const now = numberToHrtime(performance.now())

  return { sec: origin[0] + now[0], nsec: origin[1] + now[1] }
}

function numberToHrtime(epochMillis: number) {
  const epochSeconds = epochMillis / 1000
  const seconds = Math.trunc(epochSeconds)
  const nanoseconds =
    Number((epochSeconds - seconds).toFixed(NANOSECOND_DIGITS)) *
    SECOND_TO_NANOSECONDS

  return [seconds, nanoseconds]
}

export function processGetuid() {
  return (process.getuid ?? (() => -1))()
}

export function ndjsonStringify(elements: any[]): string {
  return elements.map(element => JSON.stringify(element)).join("\n")
}

export function ndjsonParse(data: string): any[] {
  return data.split("\n").map(line => JSON.parse(line))
}

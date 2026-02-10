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
 * @internal
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
 * @internal
 */
export function isWritable(path: string) {
  try {
    fs.accessSync(path, fs.constants.W_OK)
    return true
  } catch (_) {
    return false
  }
}

/**
 * Returns a high-resolution time tuple containing the current time in seconds and nanoseconds.
 *
 * @function
 * @internal
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

/** @internal */
export function processGetuid() {
  return (process.getuid ?? (() => -1))()
}

/** @internal */
export function ndjsonStringify(elements: any[]): string {
  return elements.map(element => JSON.stringify(element)).join("\n")
}

/** @internal */
export function ndjsonParse(data: string): any[] {
  return data.split("\n").map(line => JSON.parse(line))
}

/** @internal */
export type Stub<F extends (...args: any[]) => any> = F & {
  set: (fn: F) => void
  reset: () => void
}

/** @internal */
export function stubbable<T extends any[], U>(
  original: (...args: T) => U
): Stub<(...args: T) => U> {
  let current: (...args: T) => U = original

  const stub = {
    [original.name]: function (...args: T): U {
      return current(...args)
    }
  }[original.name] as Stub<(...args: T) => U>

  function set(fn: (...args: T) => U) {
    current = fn
  }

  function reset() {
    current = original
  }

  stub.set = set
  stub.reset = reset

  return stub
}

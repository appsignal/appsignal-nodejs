import { stubbable } from "../utils"

const HEARTBEAT_INTERVAL_MILLISECONDS = 30_000

/** @internal */
export const heartbeatInterval = stubbable(
  () => HEARTBEAT_INTERVAL_MILLISECONDS
)

let continuousHeartbeats: NodeJS.Timeout[] = []

/** @internal */
export function addContinuousHeartbeat(interval: NodeJS.Timeout) {
  continuousHeartbeats.push(interval)
}

/** @internal */
export function killContinuousHeartbeats() {
  continuousHeartbeats.forEach(clearInterval)
  continuousHeartbeats = []
}

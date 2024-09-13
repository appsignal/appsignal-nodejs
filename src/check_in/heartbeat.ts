import { stubbable } from "../utils"

const HEARTBEAT_INTERVAL_MILLISECONDS = 30_000

export const heartbeatInterval = stubbable(
  () => HEARTBEAT_INTERVAL_MILLISECONDS
)

let continuousHeartbeats: NodeJS.Timeout[] = []

export function addContinuousHeartbeat(interval: NodeJS.Timeout) {
  continuousHeartbeats.push(interval)
}

export function killContinuousHeartbeats() {
  continuousHeartbeats.forEach(clearInterval)
  continuousHeartbeats = []
}

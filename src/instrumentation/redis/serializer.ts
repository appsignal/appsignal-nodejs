// dbStatementSerializer for OpenTelemetry node-redis and ioredis packages
// This ensures no sensitive data is sent in Redis queries.
export function RedisDbStatementSerializer(command: string, args: Array<any>) {
  const values = []
  if (args.length > 0) {
    for (let i = 0; i < args.length; i++) {
      values.push("?")
    }
    return `${command} ${values.join(" ")}`
  } else {
    return command
  }
}

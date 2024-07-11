/**
 * AppSignal for Node.js
 * @module Appsignal
 */

export { Client as Appsignal } from "./client"
export { SpanProcessor } from "./span_processor"
export { RedisDbStatementSerializer } from "./instrumentation/redis/serializer"
export { RedisDbStatementSerializer as IORedisDbStatementSerializer } from "./instrumentation/redis/serializer"
export { expressErrorHandler } from "./instrumentation/express/error_handler"
export { LoggerLevel, LoggerAttributes } from "./logger"
export { WinstonTransport } from "./winston_transport"
export * from "./helpers"
export * as checkIn from "./check_in"
export { Heartbeat, heartbeat } from "./heartbeat"

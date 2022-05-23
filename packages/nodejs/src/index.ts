// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../vendor.d.ts" />

/**
 * AppSignal for Node.js
 * @module Appsignal
 */

export { BaseClient as Appsignal } from "./client"
export { SpanProcessor } from "./span_processor"
export { RedisDbStatementSerializer } from "./instrumentation/redis/opentelemetry"
export { RedisDbStatementSerializer as IORedisDbStatementSerializer } from "./instrumentation/redis/opentelemetry"
export * from "./interfaces"

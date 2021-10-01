import { Span, Tracer, Plugin } from "../../interfaces"
import shimmer from "shimmer"
import redis from "redis"

export const PLUGIN_NAME = "redis"

// quick alias to expose a type for the entire module
type RedisModule = typeof redis

type RedisCallback = <T>(err: Error | null, reply: T) => void

function wrapCallback(tracer: Tracer, span: Span, done: RedisCallback) {
  // @TODO: add results to span here?
  const fn = function <T>(err: Error | null, res: T) {
    if (err) tracer.setError(err)

    span.close()

    if (done) {
      done(err, res)
    }
  }

  return tracer.wrap(fn)
}

function createRedisSendCommandWrapper(tracer: Tracer) {
  return function internalSendCommandWrap(original: Function) {
    return function wrapRedisSendCommand(
      this: redis.RedisClient,
      cmd: { callback: RedisCallback; command: string } | string,
      args?: any[],
      cb?: RedisCallback
    ) {
      const rootSpan = tracer.currentSpan()

      if (!rootSpan || !cmd) {
        return original.apply(this, [cmd, args, cb])
      }

      const span = rootSpan
        .child()
        // yikes, had to override the typechecker here :/
        .setName(`Redis query to ${(this as any).address ?? "[unknown]"}`)
        .setCategory("query.redis")

      typeof cmd === "string"
        ? span.set("appsignal:body", cmd)
        : span.set("appsignal:body", cmd.command)

      if (arguments.length === 1 && typeof cmd === "object") {
        cmd.callback = wrapCallback(tracer, span, cmd.callback)
        return original.call(this, cmd)
      }

      if (
        !cmd ||
        !args ||
        typeof cmd !== "string" ||
        !Array.isArray(args) ||
        (cb && typeof cb !== "function")
      ) {
        return original.apply(this, [cmd, args, cb])
      }

      if (!cb) {
        if (
          typeof args[args.length - 1] === "function" ||
          typeof args[args.length - 1] === "undefined"
        ) {
          cb = args.pop()
        }
      }

      // it's ok to pass `undefined` here, so we override the typecheck for `cb`
      return original.apply(this, [cmd, args, wrapCallback(tracer, span, cb!)])
    }
  }
}

export const instrument = (
  mod: RedisModule,
  tracer: Tracer
): Plugin<RedisModule> => ({
  version: ">= 3.0.0",
  install(): RedisModule {
    shimmer.wrap(
      mod.RedisClient.prototype,
      "internal_send_command",
      createRedisSendCommandWrapper(tracer)
    )

    return mod
  },
  uninstall(): void {
    shimmer.unwrap(mod.RedisClient.prototype, "internal_send_command")
  }
})

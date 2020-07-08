import shimmer from "shimmer"
import redis from "redis"
import { Tracer, Plugin } from "@appsignal/nodejs"

// quick alias to expose a type for the entire module
type RedisModule = typeof redis

export const PLUGIN_NAME = "redis"

export const instrument = (
  mod: RedisModule,
  tracer: Tracer
): Plugin<RedisModule> => ({
  version: ">= 3",
  install(): RedisModule {
    console.log("INSTALL REDIS")
    shimmer.wrap(
      mod.RedisClient.prototype,
      "internal_send_command",
      original => {
        return function wrapRedisSendCommand(
          this: redis.RedisClient,
          ...args: any[]
        ) {
          const rootSpan = tracer.currentSpan()
          const command = args[0]

          if (!rootSpan || !command) {
            return original.apply(this, args as any)
          }

          const span = rootSpan
            .child()
            .setCategory("command.redis")
            .setName(command.command)

          let returned: any

          console.log("BEFORE")
          returned = original.apply(this, args as any)
          console.log(args[0])
          console.log("AFTER")

          // Question: Do we need to do something with the callback
          // that can be in the command? Probably we do?

          span.close()

          return returned
        }
      }
    )

    return mod
  },
  uninstall(): void {
    console.log("UNINSTALL REDIS")
    shimmer.unwrap(mod.RedisClient.prototype, "internal_send_command")
  }
})

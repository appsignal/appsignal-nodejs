import Hook from "require-in-the-middle"
import semver from "semver"

import { getPackageVerson } from "./utils"
import { Plugin } from "./interfaces/plugin"
import { Tracer } from "./interfaces/tracer"
import { Metrics } from "./interfaces/metrics"

type InstrumentedModule = { name: string; hook: Hook }

/**
 * The Instrumentation class.
 * @class
 */
export class Instrumentation {
  active: InstrumentedModule[]

  #tracer: Tracer
  #meter: Metrics

  constructor(tracer: Tracer, meter: Metrics) {
    this.active = []

    this.#tracer = tracer
    this.#meter = meter
  }

  /**
   * Loads custom instrumentation for a given module. The instrumentation is
   * loaded when a modules is required using the global `require` function.
   */
  public load<T>(
    name: string,
    fn: (module: T, tracer: Tracer, meter: Metrics) => Plugin<T>
  ): void {
    const hook = Hook([name], (mod: T, _, basedir: string) => {
      // we use the current node version as the given version
      // if the module is internal (i.e. no `package.json`)
      const version = basedir
        ? getPackageVerson(basedir)
        : process.versions.node

      // init the plugin
      const plugin = fn(mod, this.#tracer, this.#meter)

      // install if version range matches
      if (semver.satisfies(version, plugin.version)) {
        return plugin.install()
      } else {
        console.warn(
          `Unable to instrument module ${name}, module version needs to satisfy version range ${plugin.version}`
        )

        return mod
      }
    })

    this.active.push({ name, hook })

    return
  }

  /**
   * Removes all custom instrumentation for a given module name. Any
   * subsequent calls to `require` for this instrumentation after calling
   * this method will not include instrumentation.
   */
  public unload(name: string): void {
    this.active = this.active.filter(active => {
      if (active.name !== name) {
        return true
      } else {
        const { hook } = active
        hook.unhook()
        return false
      }
    })

    return
  }

  /**
   * Removes all custom instrumentation. Any subsequent calls to `require`
   * after calling this method will not include instrumentation.
   */
  public unloadAll(): void {
    this.active.forEach(active => {
      const { hook } = active
      hook.unhook()
    })

    this.active = []
    return
  }
}

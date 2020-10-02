import Hook from "require-in-the-middle"
import semver from "semver"

import { getPackageVerson } from "./utils"
import { Plugin } from "./interfaces/plugin"
import { Tracer } from "./interfaces/tracer"
import { Metrics } from "./interfaces/metrics"

type InstrumentedModule<T> = { name: string; plugin: Plugin<T>; hook: Hook }

/**
 * The Instrumentation class.
 * @class
 */
export class Instrumentation {
  active: InstrumentedModule<any>[]

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
  ): InstrumentedModule<T>[] {
    let plugin: Plugin<T> | undefined

    const hook = Hook([name], (mod: T, _, basedir: string) => {
      // we use the current node version as the given version
      // if the module is internal (i.e. no `package.json`)
      const version = basedir
        ? getPackageVerson(basedir)
        : process.versions.node

      // init the plugin
      plugin = fn(mod, this.#tracer, this.#meter)

      // install if version range matches
      if (semver.satisfies(version, plugin.version)) {
        return plugin.install()
      } else {
        console.warn(
          `Unable to instrument module ${name}, module version needs to satisfy version range ${plugin.version}`
        )

        // abandon the plugin
        plugin = undefined

        return mod
      }
    })

    if (plugin !== undefined) {
      this.active.push({ name, plugin, hook })
    }

    return this.active
  }

  /**
   * Removes all custom instrumentation for a given module name. Any
   * subsequent calls to `require` for this instrumentation after calling
   * this method will not include instrumentation.
   */
  public unload(name: string): InstrumentedModule<any>[] {
    this.active = this.active.filter(active => {
      if (active.name !== name) {
        return true
      } else {
        const { plugin, hook } = active

        plugin.uninstall()
        hook.unhook()

        return false
      }
    })

    return this.active
  }

  /**
   * Removes all custom instrumentation. Any subsequent calls to `require`
   * after calling this method will not include instrumentation.
   */
  public unloadAll(): InstrumentedModule<any>[] {
    this.active.forEach(active => {
      const { plugin, hook } = active

      plugin.uninstall()
      hook.unhook()
    })

    this.active = []
    return this.active
  }
}

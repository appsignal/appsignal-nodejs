import path from "path"
import Hook from "require-in-the-middle"
import semver from "semver"

import { Tracer } from "./tracer"
import { Plugin } from "./interfaces/plugin"

/**
 * The Instrumentation class.
 * @class
 */
export class Instrumentation {
  public active: { name: string; plugin: Plugin<any>; hook: Hook }[]
  private _tracer: Tracer

  constructor(tracer: Tracer) {
    this.active = []
    this._tracer = tracer
  }

  /**
   * Loads custom instrumentation for a given module. The instrumentation is
   * loaded when a modules is required using the global `require` function.
   */
  public load<T>(name: string, fn: (module: T, tracer: Tracer) => Plugin<T>) {
    let plugin: Plugin<T> | undefined

    const hook = Hook([name], (mod: T, _, basedir: string) => {
      // we use the current node version as the given version
      // if the module is internal (i.e. no `package.json`)
      const version = basedir
        ? this._getPackageVerson(basedir)
        : process.versions.node

      // init the plugin
      plugin = fn(mod, this._tracer)

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
   * Removes all custom instrumentation. Any subsequent calls to `require`
   * after calling this method will not include instrumentation.
   */
  public unloadAll() {
    this.active.forEach(active => {
      const { plugin, hook } = active

      plugin.uninstall()
      hook.unhook()
    })

    this.active = []
    return this.active
  }

  /**
   * Retrieve a valid version number from a `package.json` in a given
   * `basedir`.
   *
   * @private
   */
  private _getPackageVerson(basedir: string): string {
    const { version } = require(path.join(basedir, "package.json"))
    return version
  }
}

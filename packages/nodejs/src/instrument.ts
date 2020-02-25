import Hook from "require-in-the-middle"

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
    let plugin: Plugin<T>

    const hook = Hook([name], (mod: T) => {
      plugin = fn(mod, this._tracer)
      return plugin.install()
    })

    // @ts-ignore: `plugin` is really assigned before being used
    this.active.push({ name, plugin, hook })
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
}

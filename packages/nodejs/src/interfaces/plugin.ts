/**
 * A pre-packaged set of custom instrumentation for a Node.js module.
 */
export interface Plugin<T> {
  version: string
  install: () => T
  uninstall: () => void
}

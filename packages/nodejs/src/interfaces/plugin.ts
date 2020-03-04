export interface Plugin<T> {
  version: string
  install: () => T
  uninstall: () => void
}

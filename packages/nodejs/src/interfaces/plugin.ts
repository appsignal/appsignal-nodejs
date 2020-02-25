export interface Plugin<T> {
  name: string
  version: string
  install: () => T
  uninstall: () => void
}

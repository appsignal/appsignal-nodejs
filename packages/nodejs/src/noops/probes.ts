import { Probes } from "../interfaces"

export class NoopProbes implements Probes {
  public get count(): number {
    return 0
  }

  public register(name: string, fn: () => void): this {
    return this
  }

  public unregister(name: string): this {
    return this
  }

  public clear(): this {
    return this
  }
}

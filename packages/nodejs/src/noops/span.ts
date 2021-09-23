import { HashMap, NodeSpan } from "@appsignal/types"

export class NoopSpan implements NodeSpan {
  public get traceId(): string {
    return "0"
  }

  public get spanId(): string {
    return "0"
  }

  public set(key: string, value: string | number | boolean): this {
    return this
  }

  public child(): NoopSpan {
    return new NoopSpan()
  }

  public addError(error: Error): this {
    console.warn("addError() is deprecated. Use setError() from tracer object instead")

    return this
  }

  public setError(error: Error): this {
    return this
  }

  public setName(name: string): this {
    return this
  }

  public setSQL(keyOrValue: string, value?: string): this {
    return this
  }

  public setCategory(category: string): this {
    return this
  }

  public setSampleData(
    key: string,
    data: Array<string | number | boolean> | HashMap<string | number | boolean>
  ): this {
    return this
  }

  public close(endTime?: number): this {
    return this
  }

  public toJSON(): string {
    return "{}"
  }
}

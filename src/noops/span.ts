import { HashMap } from "@appsignal/types"
import { Span, SpanData } from "../interfaces"

export class NoopSpan implements Span {
  public get traceId(): string {
    return "0"
  }

  public get spanId(): string {
    return "0"
  }

  public set(_key: string, _value: string | number | boolean): this {
    return this
  }

  public child(): NoopSpan {
    return new NoopSpan()
  }

  public addError(_error: Error): this {
    console.warn(
      "DEPRECATED: Please use the `tracer.setError` helper instead to set the error on the root span."
    )
    return this
  }

  public setError(_error: Error): this {
    return this
  }

  public setName(_name: string): this {
    return this
  }

  public setSQL(_keyOrValue: string, _value?: string): this {
    return this
  }

  public setCategory(_category: string): this {
    return this
  }

  public setSampleData(_key: string, _data: Array<any> | HashMap<any>): this {
    return this
  }

  public close(_endTime?: number): this {
    return this
  }

  public get open(): boolean {
    return false
  }

  public toObject(): SpanData {
    return {}
  }
}

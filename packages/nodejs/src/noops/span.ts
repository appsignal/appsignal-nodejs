import { Span } from "../interfaces/span"

export class NoopSpan implements Span {
  public get traceId(): string {
    return "0"
  }

  public get spanId(): string {
    return "0"
  }

  public set(key: string, value: string | number | boolean): this {
    return this
  }

  public child(name: string): NoopSpan {
    return new NoopSpan()
  }

  public setNamespace(value: string): this {
    return this
  }

  public addError(error: Error): this {
    return this
  }

  public setSampleData(
    key: string,
    data: Array<any> | { [key: string]: any }
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

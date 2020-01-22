import { NoopSpan } from "./span"
import { ISpan } from "../interfaces/ISpan"
import { ITracer } from "../interfaces/ITracer"

export class NoopTracer implements ITracer {
  public createSpan(name: string, span?: ISpan): ISpan | undefined {
    return new NoopSpan()
  }

  public currentSpan(): ISpan | undefined {
    return
  }

  public instrument(span: ISpan, fn: (s: ISpan) => any): Promise<any> {
    return Promise.resolve()
  }

  public withSpan(span: ISpan, fn: (s: ISpan) => any): Promise<any> {
    return Promise.resolve()
  }
}

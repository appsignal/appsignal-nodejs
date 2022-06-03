import { span } from "./extension_wrapper"
import { Data } from "./internal/data"

export class OpenTelemetrySpan {
  ref: unknown

  constructor(ref: unknown) {
    this.ref = ref
  }

  public close(): this {
    span.closeSpan(this.ref)
    return this
  }

  public setError(name: string, message: string, stackdata: string): this {
    const parsedStackdata = Data.generate(stackdata.split("\n"))

    span.addSpanError(this.ref, name, message, parsedStackdata)
    return this
  }
}

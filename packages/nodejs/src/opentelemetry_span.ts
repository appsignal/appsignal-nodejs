import { span } from "./extension_wrapper"

export class OpenTelemetrySpan {
  ref: unknown

  constructor(ref: unknown) {
    this.ref = ref
  }

  public close(): this {
    span.closeSpan(this.ref)
    return this
  }
}

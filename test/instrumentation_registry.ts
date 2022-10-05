import { NodeSDK, NodeSDKConfiguration } from "@opentelemetry/sdk-node"
import { Instrumentation } from "@opentelemetry/instrumentation"

type InstrumentationsOption = NodeSDKConfiguration["instrumentations"]

export class InstrumentationTestRegistry {
  static instrumentations?: InstrumentationsOption

  static setInstrumentations(instrumentations: InstrumentationsOption) {
    this.instrumentations = instrumentations
  }

  static instrumentationNames() {
    return (this.instrumentations || []).map(
      instrumentation =>
        (instrumentation as Instrumentation).instrumentationName
    )
  }

  static clear() {
    this.instrumentations = undefined
  }
}

jest.mock("@opentelemetry/sdk-node", () => {
  const originalModule = jest.requireActual("@opentelemetry/sdk-node")
  const OriginalNodeSDK: typeof NodeSDK = originalModule.NodeSDK

  // Wrapper class that registers each created Span on the
  // SpanTestRegistry so we can access the created spans from the test.
  class TrackedNodeSDK extends OriginalNodeSDK {
    constructor(options: NodeSDKConfiguration) {
      InstrumentationTestRegistry.setInstrumentations(options.instrumentations)
      super(options)
    }
  }

  return {
    ...originalModule,
    NodeSDK: TrackedNodeSDK
  }
})

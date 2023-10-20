import { NodeSDK, NodeSDKConfiguration } from "@opentelemetry/sdk-node"
import { Instrumentation } from "@opentelemetry/instrumentation"

type InstrumentationsOption = NodeSDKConfiguration["instrumentations"]

export function instrumentationNames(instrumentations: InstrumentationsOption) {
  return instrumentations.map(
    instrumentation => (instrumentation as Instrumentation).instrumentationName
  )
}

export class InstrumentationTestRegistry {
  static instrumentations?: InstrumentationsOption
  static didInitializeSDK = false

  static setInstrumentations(instrumentations: InstrumentationsOption) {
    this.instrumentations = instrumentations
    this.didInitializeSDK = true
  }

  static instrumentationNames() {
    return instrumentationNames(this.instrumentations || [])
  }

  static clear() {
    this.instrumentations = undefined
    this.didInitializeSDK = false
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

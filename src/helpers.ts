import { SpanStatusCode, AttributeValue, trace } from "@opentelemetry/api"

function setAttribute(attribute: string, value: AttributeValue) {
  const activeSpan = trace.getActiveSpan()
  if (activeSpan) {
    activeSpan.setAttribute(attribute, value)
  }
}

function circularReplacer() {
  const seenValue: any[] = []
  const seenKey: string[] = []
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      const i = seenValue.indexOf(value)
      if (i !== -1) {
        return `[cyclic value: ${seenKey[i] || "root object"}]`
      } else {
        seenValue.push(value)
        seenKey.push(key)
      }
    }

    return value
  }
}

function setSerialisedAttribute(attribute: string, value: any) {
  const serialisedValue = JSON.stringify(value, circularReplacer())
  if (serialisedValue) {
    setAttribute(attribute, serialisedValue)
  }
}

function setPrefixedAttribute(
  prefix: string,
  suffix: string,
  value: AttributeValue
) {
  if (suffix) {
    setAttribute(`${prefix}.${suffix}`, value)
  }
}

export function setParams(params: any) {
  setSerialisedAttribute("appsignal.request.parameters", params)
}

export function setSessionData(sessionData: any) {
  setSerialisedAttribute("appsignal.request.session_data", sessionData)
}

export function setCustomData(customData: any) {
  setSerialisedAttribute("appsignal.custom_data", customData)
}

export function setTag(tag: string, value: AttributeValue) {
  setPrefixedAttribute("appsignal.tag", tag, value)
}

export function setHeader(header: string, value: AttributeValue) {
  setPrefixedAttribute("appsignal.request.headers", header, value)
}

export function setName(name: string) {
  setAttribute("appsignal.name", name)
}

export function setCategory(category: string) {
  setAttribute("appsignal.category", category)
}

export function setBody(body: string) {
  setAttribute("appsignal.body", body)
}

export function setNamespace(namespace: string) {
  setAttribute("appsignal.namespace", namespace)
}

export function setError(error: Error) {
  if (error && error.name && error.message) {
    const activeSpan = trace.getActiveSpan()
    if (activeSpan) {
      activeSpan.recordException(error)
      activeSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })
    }
  }
}

export function sendError(error: Error, fn: () => void = () => {}) {
  if (error && error.name && error.message) {
    trace
      .getTracer("Appsignal.sendError")
      .startActiveSpan(error.name, { root: true }, span => {
        setError(error)
        fn()
        span.end()
      })
  }
}

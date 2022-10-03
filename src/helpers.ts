import { AttributeValue, trace } from "@opentelemetry/api"

function setAttribute(attribute: string, value: AttributeValue) {
  const currentSpan = trace.getActiveSpan()
  if (currentSpan) {
    currentSpan.setAttribute(attribute, value)
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

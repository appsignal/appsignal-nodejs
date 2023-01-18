import { trace, SpanStatusCode } from "@opentelemetry/api"
import { Client } from "./client"

import type { Span, AttributeValue } from "@opentelemetry/api"

function setAttribute(attribute: string, value: AttributeValue, span?: Span) {
  const activeSpan = span ?? trace.getActiveSpan()
  if (activeSpan) {
    activeSpan.setAttribute(attribute, value)
  } else {
    const splitAttributes = attribute.split(".")
    const attributeSuffix = splitAttributes[splitAttributes.length - 1]
    Client.integrationLogger.debug(
      `There is no active span, cannot set \`${attributeSuffix}\``
    )
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

function setSerialisedAttribute(attribute: string, value: any, span?: Span) {
  const serialisedValue = JSON.stringify(value, circularReplacer())
  if (serialisedValue) {
    setAttribute(attribute, serialisedValue, span)
  }
}

function setPrefixedAttribute(
  prefix: string,
  suffix: string,
  value: AttributeValue,
  span?: Span
) {
  if (suffix) {
    setAttribute(`${prefix}.${suffix}`, value, span)
  }
}

export function setParams(params: any, span?: Span) {
  setSerialisedAttribute("appsignal.request.parameters", params, span)
}

export function setSessionData(sessionData: any, span?: Span) {
  setSerialisedAttribute("appsignal.request.session_data", sessionData, span)
}

export function setCustomData(customData: any, span?: Span) {
  setSerialisedAttribute("appsignal.custom_data", customData, span)
}

export function setTag(tag: string, value: AttributeValue, span?: Span) {
  setPrefixedAttribute("appsignal.tag", tag, value, span)
}

export function setHeader(header: string, value: AttributeValue, span?: Span) {
  setPrefixedAttribute("appsignal.request.headers", header, value, span)
}

export function setName(name: string, span?: Span) {
  setAttribute("appsignal.name", name, span)
}

export function setCategory(category: string, span?: Span) {
  setAttribute("appsignal.category", category, span)
}

export function setBody(body: string, span?: Span) {
  setAttribute("appsignal.body", body, span)
}

export function setNamespace(namespace: string, span?: Span) {
  setAttribute("appsignal.namespace", namespace, span)
}

export function setRootName(name: string, span?: Span) {
  setAttribute("appsignal.root_name", name, span)
}

export function setError(error: Error, span?: Span) {
  if (error && error.name && error.message) {
    const activeSpan = span ?? trace.getActiveSpan()
    if (activeSpan) {
      activeSpan.recordException(error)
      activeSpan.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      })
    } else {
      Client.integrationLogger.debug(
        `There is no active span, cannot set \`${error.name}\``
      )
    }
  } else {
    Client.integrationLogger.debug(
      "Cannot set error, it is not an `Error`-like object"
    )
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
  } else {
    Client.integrationLogger.debug(
      "Cannot send error, it is not an `Error`-like object"
    )
  }
}

export function instrumentationsLoaded(): Promise<void> {
  const globallyStoredClient = Client.client

  if (globallyStoredClient) {
    return globallyStoredClient.instrumentationsLoaded
  } else {
    Client.integrationLogger.debug(
      "Client is not initialized, cannot get OpenTelemetry instrumentations loaded"
    )
    return Promise.resolve()
  }
}

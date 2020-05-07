import shimmer from "shimmer"
import { Submittable } from "pg"
import { Tracer, Span } from "@appsignal/nodejs"

interface Handlers {
  handleError?: (msg: any) => any
  handleReadyForQuery?: () => any
}

export function patchCallback(tracer: Tracer, span: Span, callback: Function) {
  return tracer.wrap((err: Error | null, res?) => {
    if (err) span.addError(err)
    span.close()
    return callback(err, res)
  })
}

export function patchSubmittable(
  tracer: Tracer,
  span: Span,
  submittable: Submittable & Handlers
): Submittable {
  let spanEnded = false

  if (submittable.handleError) {
    shimmer.wrap(submittable, "handleError", original => {
      return tracer.wrap(function (this: Submittable, ...args: any[]): void {
        if (!spanEnded) {
          const err: Error = args[0]
          span.addError(err).close()
          spanEnded = true
        }

        if (original) {
          return original.apply(this, args as any)
        }
      })
    })
  }

  if (submittable.handleReadyForQuery) {
    shimmer.wrap(submittable, "handleReadyForQuery", original => {
      return tracer.wrap(function (this: Submittable, ...args: any[]): void {
        if (!spanEnded) {
          span.close()
          spanEnded = true
        }

        if (original) {
          return original.apply(this, args as any)
        }
      })
    })
  }

  return submittable
}

export function patchPromise<T>(span: Span, promise: Promise<T>) {
  return promise.then(
    res => {
      span.close()
      return res
    },
    err => {
      span.addError(err).close()
      throw err
    }
  )
}

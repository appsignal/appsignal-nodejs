import { Tracer, NodeSpan } from "@appsignal/types"
import shimmer from "shimmer"
import { Submittable } from "pg"

interface Handlers {
  handleError?: (msg: any) => any
  handleReadyForQuery?: () => any
}

export function patchCallback(
  tracer: Tracer,
  span: NodeSpan,
  callback: Function
) {
  return tracer.wrap((err: Error | null, res?) => {
    if (err) tracer.setError(err)
    span.close()
    return callback(err, res)
  })
}

export function patchSubmittable(
  tracer: Tracer,
  span: NodeSpan,
  submittable: Submittable & Handlers
): Submittable {
  let spanEnded = false

  if (submittable.handleError) {
    shimmer.wrap(submittable, "handleError", original => {
      return tracer.wrap(function (this: Submittable, ...args: any[]): void {
        if (!spanEnded) {
          const err: Error = args[0]
          tracer.setError(err)
          span.close()
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

export function patchPromise<T>(
  tracer: Tracer,
  span: NodeSpan,
  promise: Promise<T>
) {
  return promise.then(
    res => {
      span.close()
      return res
    },
    err => {
      tracer.setError(err)
      span.close()
      throw err
    }
  )
}

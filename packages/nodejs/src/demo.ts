import { Tracer } from "./interfaces"

/**
 * Sends a demonstration/test sample for a exception and a performance issue.
 *
 * Note that the agent must be active for at least 60 seconds in order for the payload
 * to be sent to AppSignal.
 *
 * This is also a good place to start if you want to see what custom instrumentation
 * looks like in the wild!
 */
export function demo(tracer: Tracer) {
  // performance sample
  tracer.withSpan(tracer.createSpan(), span => {
    span
      .setName("GET /demo")
      .setCategory("process_request.http")
      .set("demo_sample", true)
      .setSampleData("environment", { method: "GET", request_path: "/demo" })

    setTimeout(() => {
      tracer.withSpan(span.child(), (child: any) => {
        child.setCategory("query.mongodb")
        setTimeout(() => child.close(), 50)
      })
    }, 25)

    setTimeout(() => span.close(), 100)
  })

  // error sample
  tracer.withSpan(tracer.createSpan(), span => {
    tracer.setError(
      new Error(
        "Hello world! This is an error used for demonstration purposes."
      )
    )

    span.setName("GET /demo").setCategory("process_request.http").close()
  })
}

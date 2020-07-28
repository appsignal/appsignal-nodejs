import { Appsignal } from "@appsignal/nodejs"
import { ApolloServerPlugin } from "apollo-server-plugin-base"

export const createApolloPlugin = (appsignal: Appsignal, _options = {}) => {
  const tracer = appsignal.tracer()

  return (): ApolloServerPlugin => ({
    requestDidStart: () => {
      const rootSpan = tracer.currentSpan().setName(`[unknown graphql query]`)

      return {
        didResolveOperation: ({ operationName }) => {
          // we can be pretty certain that `operationName` exists here
          // (that's what this lifecycle hook is for, after all), so
          // we use the bang here. if it's undefined due to no operation name
          // being defined, the default is used anyway
          rootSpan.setName(operationName!)
        },
        executionDidStart: ({ request }) => {
          const execSpan = rootSpan
            .child()
            .setCategory("execute.graphql")
            .setName("GraphQL | Execute")
            .set("appsignal:body", request.query ?? "")

          return {
            executionDidEnd: err => {
              if (err) execSpan.addError(err)
              execSpan.close()
            }
          }
        },
        parsingDidStart: () => {
          const parseSpan = rootSpan.child().setCategory("parse.graphql")

          return err => {
            if (err) parseSpan.addError(err)
            parseSpan.close()
          }
        },
        validationDidStart: () => {
          const validateSpan = rootSpan.child().setCategory("validate.graphql")

          return err => {
            // take only the first error
            if (err) validateSpan.addError(err[0])
            validateSpan.close()
          }
        }
      }
    }
  })
}

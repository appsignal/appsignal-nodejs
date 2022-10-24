import Fastify from "fastify"

const port = Number(process.env.PORT)

const fastify = Fastify({
  logger: true
})

fastify.get("/", function (_request, reply) {
  reply.send({ hello: "world" })
})

fastify.get("/error", function (_request, reply) {
  throw new Error("EXPECTED ERROR!")

  reply.send({ never: "gets" })
})

fastify.listen({ port, host: "0.0.0.0" }, function (err, _address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }

  console.log(`Example app listening on port ${port}`)
})

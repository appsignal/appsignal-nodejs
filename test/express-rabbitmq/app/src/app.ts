import express from "express"
import { setTag, setCustomData, expressErrorHandler } from "@appsignal/nodejs"
import { trace } from "@opentelemetry/api"
import cookieParser from "cookie-parser"
import client from "amqplib"

const port = process.env.PORT

const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.get("/", (_req: any, res: any) => {
  res.send("200 OK")
})

app.get("/route-param/:id", (_req: any, res: any) => {
  res.send("200 OK")
})

app.get("/error", (_req: any, _res: any) => {
  throw new Error("Expected test error!")
})

app.get("/rabbitmq", async (_req: any, res: any, next: any) => {
  try {
    const connection = await client.connect(`amqp://guest:guest@rabbitmq:5672`)
    const channel = await connection.createChannel()

    channel.assertQueue("queue")
    channel.sendToQueue("queue", Buffer.from(JSON.stringify("Test value")))

    channel.consume(
      "queue",
      (msg: any) => {
        const value = msg?.content?.toString()
        res.send(`
      <h1>OpenTelemetryRabbitMQ example</h1>
      <p>The query result should be "Test value": ${value}</p>
      `)
      },
      { noAck: true }
    )
  } catch (e) {
    next(e)
  }
})

app.get("/custom", (_req: any, res: any) => {
  setCustomData({ custom: "data" })

  trace.getTracer("custom").startActiveSpan("Custom span", span => {
    setTag("custom", "tag")

    span.end()
  })

  res.send("200 OK")
})

app.use(expressErrorHandler())

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

import appsignal from "./appsignal"
import express from "express"
import { createClient } from "redis"
import ioredis from "ioredis"
import { nextTick } from "process"

const redisHost = "redis://redis:6379"
const port = process.env.PORT

const app = express()
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: any, res: any) => {
  res.send("200 OK")
})

app.get("/redis", async (req: any, res: any, next: any) => {
  try {
    const client = createClient({ url: redisHost })
    client.once("error", (error: Error) => {
      next(error)
    })

    await client.connect()
    await client.set("test_key", "Test value")
    const value = await client.get("test_key")
    res.send(`
      <h1>OpenTelemetry Redis 4 example</h1>
      <p>The query result should be "Test value": ${value}</p>
    `)
  } catch (e) {
    next(e)
  }
})

app.get("/ioredis", async (req: any, res: any, next: any) => {
  try {
    const client = new ioredis(redisHost)
    await client.set("test_key", "Test value")
    const value = await client.get("test_key")
    res.send(`
      <h1>OpenTelemetry ioredis example</h1>
      <p>The query result should be "Test value": ${value}</p>
    `)
  } catch (e) {
    next(e)
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

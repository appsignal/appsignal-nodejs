import appsignal from "./appsignal"
import express from "express"
import redis from "redis"
import ioredis from "ioredis"

const redisHost = "redis://redis:6379"
const port = process.env.PORT

const app = express()
app.use(express.urlencoded({ extended: true }))

app.get("/", (req: any, res: any) => {
  res.send(`
    <h1>OpenTelemetry example app</h1>
    <ul>
      <li><a href="/redis">/redis</a></li>
      <li><a href="/ioredis">/ioredis</a></li>
      <li><a href="/get?get-param1=value-1&get-param2=value-2">/get</a></li>
      <li>
        <form action="/post" method="post">
          <input type="hidden" name="post-param1" value="value 1">
          <input type="hidden" name="post-param2" value="value 2">
          <button type="submit" name="express-post" value="express-post">/post</button>
        </form>
      </li>
      <li><a href="/error">/error</a></li>
    </ul>
  `)
})

app.get("/redis", async (req: any, res: any) => {
  const client = redis.createClient({ url: redisHost })
  client.once("error", (error: Error) => {
    throw error
  })

  await client.set("test_key", "Test value")
  const value = await client.get("test_key")
  res.send(`
    <h1>OpenTelemetry Redis 4 example</h1>
    <p>The query result should be "Test value": ${value}</p>
  `)
})

app.get("/ioredis", async (req: any, res: any) => {
  const client = new ioredis(redisHost)
  await client.set("test_key", "Test value")
  const value = await client.get("test_key")
  res.send(`
    <h1>OpenTelemetry ioredis example</h1>
    <p>The query result should be "Test value": ${value}</p>
  `)
})

app.get("/get", async (req: any, res: any) => {
  res.send("GET received!")
})

app.post("/post", async (req: any, res: any) => {
  res.json({ requestBody: req.body })
})

app.get("/error", (req: any, res: any) => {
  throw new Error("This is a test error")

  res.send("GET Query received!")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

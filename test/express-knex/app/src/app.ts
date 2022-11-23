import express from "express"
import knexLib from "knex"

const knex = knexLib({
  client: "pg",
  connection: process.env.DATABASE_URL
})

const port = process.env.PORT
const app = express()

app.use(express.urlencoded({ extended: true }))

interface Post {
  id: number
  title: string
  body: string
}

app.get("/", async (_req: any, res: any) => {
  const post = await knex<Post>("posts").orderBy("id", "desc").first()
  res.send(`Last post: ${post ? post.title : "No post"}`)
})

app.get("/create", async (_req: any, res: any) => {
  const posts = knex("posts")
  const count = parseInt(await posts.count("id"))
  await posts.insert([
    { title: `Post title ${count + 1}`, body: "Post body" },
    { title: `Post title ${count + 2}`, body: "Post body" }
  ])
  res.send("Two posts created")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

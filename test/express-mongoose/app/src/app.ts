import express from "express"
import { connect, Post } from "./db"

connect().catch(err => {
  console.log(err)
  process.exit(1)
})

const port = process.env.PORT
const app = express()
app.use(express.urlencoded({ extended: true }))

app.get("/", async (_req: any, res: any) => {
  const allPosts = await Post.find()
  res.send(`LISTING POSTS ${JSON.stringify(allPosts)}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

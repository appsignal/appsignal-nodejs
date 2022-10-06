import express from "express"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const port = process.env.PORT
const app = express()
app.use(express.urlencoded({ extended: true }))

app.get("/", async (_req: any, res: any) => {
  const allPosts = await prisma.post.findMany()
  res.send(`LISTING POSTS ${JSON.stringify(allPosts)}`)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

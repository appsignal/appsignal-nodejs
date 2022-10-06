import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seed() {
  await prisma.post.deleteMany()

  await prisma.post.create({
    data: {
      title: "A first post",
      content: "Foo Bar Lorem Ipsum Blah",
      published: true,
      author: "Luismi Ramirez"
    }
  })

  await prisma.post.create({
    data: {
      title: "A second post",
      content: "Foo Baz Fuz Lorem Ipsum Blah",
      published: true,
      author: "Luismi Ramirez"
    }
  })
}

seed()

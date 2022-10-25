import { connect, Post } from "./db"

async function seed() {
  await connect()

  const firstPost = new Post({
    title: "A first post",
    content: "Foo Bar Lorem Ipsum Blah",
    published: true,
    author: "Luismi Ramirez"
  })

  await firstPost.save()

  const secondPost = new Post({
    title: "A second post",
    content: "Foo Baz Fuz Lorem Ipsum Blah",
    published: true,
    author: "Luismi Ramirez"
  })

  await secondPost.save()

  process.exit(0)
}

seed().catch(err => {
  console.log(err)
  process.exit(1)
})

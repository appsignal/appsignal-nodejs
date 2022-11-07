import { connect, Post, PostCollection } from "./db"

async function seed() {
  const Posts = PostCollection(await connect())

  const firstPost: Post = {
    title: "A first post",
    content: "Foo Bar Lorem Ipsum Blah",
    published: true,
    author: "Luismi Ramirez"
  }

  await Posts.insertOne(firstPost)

  const secondPost = {
    title: "A second post",
    content: "Foo Baz Fuz Lorem Ipsum Blah",
    published: true,
    author: "Luismi Ramirez"
  }

  await Posts.insertOne(secondPost)

  process.exit(0)
}

seed().catch(err => {
  console.log(err)
  process.exit(1)
})

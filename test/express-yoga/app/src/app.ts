import express from "express"
import { createSchema, createYoga } from "graphql-yoga"

const port = process.env.PORT
const app = express()

const typeDefs = /* GraphQL */ `
  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }
  type Author {
    author: String
  }
  type Query {
    books: [Book]
    authors: [Author]
  }
`

const books = [
  {
    title: "The Awakening",
    author: "Kate Chopin"
  },
  {
    title: "City of Glass",
    author: "Paul Auster"
  }
]

const resolvers = {
  Query: {
    books: () => books
  }
}

const yogaServer = createYoga({
  schema: createSchema({
    typeDefs: typeDefs,
    resolvers: resolvers
  })
})

app.use("/graphql", yogaServer)

app.get("/", (_req, res) => {
  res.send('<a href="/graphql">Apollo Panel</a>')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

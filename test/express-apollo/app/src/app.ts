import express from "express"
import { ApolloServer, gql } from "apollo-server-express"

const port = process.env.PORT
const app = express()

app.use(express.urlencoded({ extended: true }))

const typeDefs = gql`
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

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers
})

app.get("/", (_req, res) => {
  res.send('<a href="/graphql">Apollo Panel</a>')
})

apolloServer.applyMiddleware({ app })
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

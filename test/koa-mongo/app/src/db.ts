import { MongoClient, Collection } from "mongodb"

export async function connect(): Promise<MongoClient> {
  const databaseURL = process.env["DATABASE_URL"]
  if (!databaseURL) {
    throw new Error("Environment variable DATABASE_URL must be set")
  }

  const client = new MongoClient(databaseURL)
  return await client.connect()
}

export interface Post {
  title: string
  content: string
  published: boolean
  author: string
}

export function PostCollection(client: MongoClient): Collection<Post> {
  return client.db().collection<Post>("posts")
}

import mongoose from "mongoose"

export async function connect() {
  const databaseURL = process.env["DATABASE_URL"]
  if (!databaseURL) {
    throw new Error("Environment variable DATABASE_URL must be set")
  }

  await mongoose.connect(databaseURL)
}

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  published: Boolean,
  author: String
})

export const Post = mongoose.model("Post", postSchema)

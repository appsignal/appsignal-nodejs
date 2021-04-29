import { useRouter } from "next/router"

const Post = () => {
  const router = useRouter()
  const { id } = router.query

  return <h1>Post: {id}</h1>
}

export default Post

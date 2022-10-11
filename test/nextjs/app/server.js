const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()
const port = parseInt(process.env.PORT, 10)

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true)

    // You might want to handle other routes here too, see
    // https://nextjs.org/docs/advanced-features/custom-server
    handle(req, res, parsedUrl)
  }).listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
})

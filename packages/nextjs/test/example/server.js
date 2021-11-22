// ENSURE APPSIGNAL IS THE FIRST THING TO BE REQUIRED/IMPORTED
// INTO YOUR APP!
const { Appsignal } = require("../../../nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>"
})

const { getRequestHandler } = require("../../../nextjs")

const url = require("url")
const next = require("next")
const { createServer } = require("http")

const PORT = parseInt(process.env.PORT, 10) || 4010

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = getRequestHandler(appsignal, app)

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = url.parse(req.url, true)
    const { pathname, query } = parsedUrl

    // You might want to handle other routes here too, see
    // https://nextjs.org/docs/advanced-features/custom-server
    handle(req, res, parsedUrl)
  }).listen(PORT, err => {
    if (err) throw err
    console.log(`Example app listening at http://localhost:${PORT}`)
  })
})

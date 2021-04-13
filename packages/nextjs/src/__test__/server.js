// const { Appsignal } = require("../../../nodejs");
// const { getRequestHandler } = require("../../../nextjs");

// const http = require('http')
// const next = require("next");

// const appsignal = new Appsignal({
//   active: true,
//   name: "<YOUR APPLICATION NAME>",
//   apiKey: "<YOUR API KEY>",
// });

// const dev = process.env.NODE_ENV !== "production";
// const app = next({ dev });
// const handle = getRequestHandler(appsignal, app);

// app.prepare().then(() => {
//   createServer((req, res) => {
//     const parsedUrl = url.parse(req.url, true);
//     const { pathname, query } = parsedUrl;

//     handle(req, res, parsedUrl);
//   }).listen(PORT, (err) => {
//     if (err) throw err;
//     console.log(`> Ready on http://localhost:${PORT}`);
//   });
// });

const http = require("http")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const dir = __dirname
const port = process.env.PORT || 3000

const app = next({ dev, dir })
const handleNextRequests = app.getRequestHandler()

app.prepare().then(() => {
  const server = new http.Server(async (req, res) => {
    handleNextRequests(req, res)
  })

  server.listen(port, err => {
    if (err) {
      throw err
    }

    console.log(`> Ready on http://localhost:${port}`)
  })
})

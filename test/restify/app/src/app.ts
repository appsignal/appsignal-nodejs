const restify = require("restify")

function respond(req: any, res: any, next: any) {
  res.send("hello " + req.params.name)
  next()
}

const server = restify.createServer()
server.use(restify.plugins.queryParser())
server.get("/", function (req: any, res: any, next: any) {
  res.send("home")
  return next()
})
server.get("/hello/:name", respond)

function sendV1(req: any, res: any, next: any) {
  res.send("goodbye: " + req.params.name)
  return next()
}

function sendV2(req: any, res: any, next: any) {
  res.send({ goodbye: req.params.name })
  return next()
}

server.get(
  "/goodbye/:name",
  restify.plugins.conditionalHandler([
    { version: "1.1.3", handler: sendV1 },
    { version: "2.0.0", handler: sendV2 }
  ])
)

const port = process.env.PORT
server.listen(port, function () {
  console.log("%s listening at %s", server.name, server.url)
})

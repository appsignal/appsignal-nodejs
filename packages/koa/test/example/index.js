const { Appsignal } = require("../../../nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  pushApiKey: "<YOUR API KEY>"
})

appsignal.instrument(require("@appsignal/koa"))
const Koa = require("koa")
const app = new Koa()
const port = 4010

app.use(async ctx => {
  ctx.body = "Hello World!"
})

app.listen(port)
console.log(`Example app listening at http://localhost:${port}`)

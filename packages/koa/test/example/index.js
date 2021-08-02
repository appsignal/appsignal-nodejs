const { Appsignal } = require("../../../nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  apiKey: "<YOUR API KEY>"
})

appsignal.instrument(require("@appsignal/koa"))
const Koa = require("koa")
const app = new Koa()

app.use(async ctx => {
  ctx.body = "Hello World!"
})

app.listen(3000)
console.log("Example app listening at http://localhost:3000")

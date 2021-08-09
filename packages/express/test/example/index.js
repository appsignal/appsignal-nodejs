const { Appsignal } = require("../../../nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  apiKey: "<YOUR API KEY>"
})

const express = require("express")
const { expressMiddleware } = require("@appsignal/express")
const app = express()
const port = 3000

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

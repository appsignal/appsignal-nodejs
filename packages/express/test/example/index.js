const { Appsignal } = require("../../../nodejs")

const appsignal = new Appsignal({
  active: true,
  name: "<YOUR APPLICATION NAME>",
  apiKey: "<YOUR API KEY>"
})

const express = require("express")
const { expressMiddleware } = require("@appsignal/express")
const app = express()
const port = 4010

app.use(expressMiddleware(appsignal))

const adminRoutes = require("./admin")
app.use("/admin", adminRoutes)

app.get("/", (req, res) => {
  res.send("Hello World!")
})

app.get("/dashboard", (req, res) => {
  res.send("Dashboard for user")
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

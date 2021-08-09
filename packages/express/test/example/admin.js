const app = require("express").Router()

app.get("/dashboard", function (req, res) {
  res.send("Dashboard for admin")
})

module.exports = app

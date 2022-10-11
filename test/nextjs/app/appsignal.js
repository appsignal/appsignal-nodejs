const { Appsignal } = require("@appsignal/nodejs")

module.exports = {
  default: new Appsignal({
    active: true,
    name: "opentelemetry-express-postgres",
    logLevel: "trace",
    log: "file",
    logPath: "/tmp",
    pushApiKey: "not-a-real-api-key"
  })
}

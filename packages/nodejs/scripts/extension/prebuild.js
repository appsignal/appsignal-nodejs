const fs = require("fs")
const childProcess = require("child_process")

function build() {
  return new Promise((resolve, reject) => {
    childProcess.exec("npm run build", error => {
      if (error) {
        return reject(error)
      } else {
        return resolve()
      }
    })
  })
}

function run() {
  // Build the package if it is the local development version that still has
  // the `src` directory. It won't run in the shipped version where the `src`
  // directory is not available.
  if (fs.existsSync("src")) {
    return build().catch(error => {
      console.error(
        "Something went wrong while building the @appsignal/nodejs package: ",
        error
      )
    })
  }
}

run()

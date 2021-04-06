const { spawn } = require("cross-spawn")
const treeKill = require("tree-kill")

const killApp = async instance => {
  await new Promise((resolve, reject) => {
    treeKill(instance.pid, err => {
      if (err) {
        if (
          process.platform === "win32" &&
          typeof err.message === "string" &&
          (err.message.includes(`no running instance of the task`) ||
            err.message.includes(`not found`))
        ) {
          // Windows throws an error if the process is already dead
          //
          // Command failed: taskkill /pid 6924 /T /F
          // ERROR: The process with PID 6924 (child process of PID 6736) could not be terminated.
          // Reason: There is no running instance of the task.
          return resolve()
        }
        return reject(err)
      }

      resolve()
    })
  })
}

const startServer = async () => {
  const env = Object.assign({}, process.env, { PORT: 5678 }, {})

  return new Promise((resolve, reject) => {
    const instance = spawn(
      "node",
      ["--no-deprecation", "src/__test__/server.js"],
      { env }
    )

    function handleStdout(data) {
      const message = data.toString()
      if (/Ready on/.test(message)) {
        resolve(instance)
      }
      process.stdout.write(message)
    }

    function handleStderr(data) {
      const message = data.toString()
      process.stderr.write(message)
    }

    instance.stdout.on("data", handleStdout)
    instance.stderr.on("data", handleStderr)

    instance.on("close", () => {
      instance.stdout.removeListener("data", handleStdout)
      instance.stderr.removeListener("data", handleStderr)
    })

    instance.on("error", err => {
      reject(err)
    })
  })
}

test("does not break the app", async () => {
  app = await startServer()
  expect(3).toBe(3)
  await killApp(app)
})

// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "9046191"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "d4a44bb6c4caeabb874424c8daae7cdb982773afa0eafd0b37b8533cd68c5b93",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "d4a44bb6c4caeabb874424c8daae7cdb982773afa0eafd0b37b8533cd68c5b93",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "0ac14b73df8238b542f5d93622959444e4c5041aaac458cc772c6210c74bb901",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "0ac14b73df8238b542f5d93622959444e4c5041aaac458cc772c6210c74bb901",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "0ac14b73df8238b542f5d93622959444e4c5041aaac458cc772c6210c74bb901",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "229f509e0a04b47051873e4a253dbbb6965f9cc62bd79902977cbb5257c91904",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "089929e5ec207871e6562fe70bdf5b236ef9473e14e6797ddbffda310d95cf8c",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "089929e5ec207871e6562fe70bdf5b236ef9473e14e6797ddbffda310d95cf8c",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "e93022433b6f4bc7bc882aeb49a5d43a004f017d41569a3459c7109768021cbb",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "1b66a0ce1ecc375dad8059df99b5bd0bc1e1723228b1256f09dee6124fa4576a",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "0b6b59ce4f1e2bc8bea6f1743e9f52dde99f39aba2922aa125cde9a1d498b52d",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "12301c2346f1654558bf6c95f605b3ca1a95433fcab3aaf303ceea59b175dcf8",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "12301c2346f1654558bf6c95f605b3ca1a95433fcab3aaf303ceea59b175dcf8",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

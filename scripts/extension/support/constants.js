// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.0"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "6fd29eeb9e828c659f71ef6d403de3b3b697c335d030ee0dc9d2765a38397c5b",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "6fd29eeb9e828c659f71ef6d403de3b3b697c335d030ee0dc9d2765a38397c5b",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "0a909251d557ed3c958a9f5d2796d232c1b4ef133baf0c02c43bcfe337bb97d2",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "0a909251d557ed3c958a9f5d2796d232c1b4ef133baf0c02c43bcfe337bb97d2",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "0a909251d557ed3c958a9f5d2796d232c1b4ef133baf0c02c43bcfe337bb97d2",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "81eb914998520e0ba72fd676b113ad79092d4c09da14f1fb6462aaddbe421556",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "d7a2d91558c1858fe821bee52062dcb427a93859cc2c76ef2d053f0f99cf7721",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "d7a2d91558c1858fe821bee52062dcb427a93859cc2c76ef2d053f0f99cf7721",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "0893cb1d449627f40f67ba12d0e6c505a9b764d3b5b59b8107531f473d57a4a7",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "937347c83f2f76d94c80e4cb72ab1527d9df7b47ce68a5342fbc106c4f615d52",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "3d697b78066fc33f966842794f7974bc8e1c7fa9ee63e733ce3d7a25f665acf5",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "23bbd30e37bc2a1793328470391187b4cc0a90602a547794086f1f982a72c8a5",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "23bbd30e37bc2a1793328470391187b4cc0a90602a547794086f1f982a72c8a5",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

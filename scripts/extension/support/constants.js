// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "c0e80b9"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "c0e1fc966eff49dd942ed07b44f5c5db6be41676f4e35530c300bac8f99e03c4",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "c0e1fc966eff49dd942ed07b44f5c5db6be41676f4e35530c300bac8f99e03c4",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "37fcdf17250ce9e2149f28a8492074f5957691636ab542c7073b323a1b9dbdd8",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "37fcdf17250ce9e2149f28a8492074f5957691636ab542c7073b323a1b9dbdd8",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "37fcdf17250ce9e2149f28a8492074f5957691636ab542c7073b323a1b9dbdd8",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "ce9075ee5bc14ea786b734793b6bb6331567398cab6a21f2ceaa9062cfbdb373",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "ea3d1a29cf1534293738f2bd27ae29b8addf8dbe34dde77dc4ae150e109e2e4f",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "ea3d1a29cf1534293738f2bd27ae29b8addf8dbe34dde77dc4ae150e109e2e4f",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "adeceb091c4ed277c29eda018ffc61fd064e5c486b2b0a239b26873168a7fdb0",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "b57aec8c334b1d3646c80d87f20372287e4e2bdbd798c195e0e36ceeb2aac68a",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "fc780524942fc7aeaa4cabec64dfc104c82969df7e8b5cd0fa8eae24c1c9b304",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "574137de415487afe8d2cc29eac3b1fda2c8e1001474b8f25ebee0cbb32fb1ca",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "574137de415487afe8d2cc29eac3b1fda2c8e1001474b8f25ebee0cbb32fb1ca",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

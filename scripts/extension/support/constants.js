// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "b644bb6"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "a5ded7b4b825b9b7c586a167ee8efe6487b96a336ae522c95a7ee74b0bc20fc4",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "a5ded7b4b825b9b7c586a167ee8efe6487b96a336ae522c95a7ee74b0bc20fc4",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "cc75752c53b079520d5cd69165b41c7fd2825044786fbb274a4ff98acbd95ab9",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "cc75752c53b079520d5cd69165b41c7fd2825044786fbb274a4ff98acbd95ab9",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "cc75752c53b079520d5cd69165b41c7fd2825044786fbb274a4ff98acbd95ab9",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "cc60cffb93121f091c58685e0dfdc4d7761cdd1a2926467e23d0a669523787c4",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "5b77c401438319a04a370dd9ba89820734a34d0f65e866f0319a14f452cc37b3",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "5b77c401438319a04a370dd9ba89820734a34d0f65e866f0319a14f452cc37b3",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "5531dfc4ff6649d974512d7c4ccde82fe9863dccd0d399f1c8fd6aae4997a6e4",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "a56d890a045de0ebf70624061bbf8e2b9008d57589faa58769f0dcc24a7d8938",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "d209f2cb8051aee9f42c88a2d643525b2eebf907e972b939aae574fd6df2cc49",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "79cf0ce3599244f2254ee41f069821b89ff147ee7b508506f039caf3cdac6411",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "79cf0ce3599244f2254ee41f069821b89ff147ee7b508506f039caf3cdac6411",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

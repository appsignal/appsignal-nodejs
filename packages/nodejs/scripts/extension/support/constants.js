// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0b43802"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "229263d5e1b5b305965e36ace1868a6e4e397f35c234d0f28ba342b329b5b95b",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "229263d5e1b5b305965e36ace1868a6e4e397f35c234d0f28ba342b329b5b95b",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "6ecffecea27f0c367afef8d060c30657332ae9fc68748099dbb8ffeca69ab295",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "6ecffecea27f0c367afef8d060c30657332ae9fc68748099dbb8ffeca69ab295",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "6ecffecea27f0c367afef8d060c30657332ae9fc68748099dbb8ffeca69ab295",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "cb9d94d4f81479076d3b8995eb27be4302cbd521a50acefa2373d060877f7872",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "12268b3412ee76985cccbc8c7f1fe7409379f3cda339cf1c2aee9df7bc976109",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "12268b3412ee76985cccbc8c7f1fe7409379f3cda339cf1c2aee9df7bc976109",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "c79c754057275872bec6191ad977232ffeb4ce6de862d5acf3235e2793d95e09",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "83374043076793ee126d229252e9dbd32e3bbbab0d2f4644adb5b15fc17ccdb8",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "c2a3c4cd066fd6098ae2ba7cb99db5fc83bb2d0eedcfdd4cd5a0282c344db58d",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "c2a3c4cd066fd6098ae2ba7cb99db5fc83bb2d0eedcfdd4cd5a0282c344db58d",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

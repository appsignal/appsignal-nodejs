// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.18"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "141313c106bd6591a2c760f2341c1856905847602699df140cf72e45397e2cd2",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "141313c106bd6591a2c760f2341c1856905847602699df140cf72e45397e2cd2",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "5e2f089e65153ff26ae2fe9c0a7bf10cd3921057bb73eeab11e50c4d21bd94d1",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "5e2f089e65153ff26ae2fe9c0a7bf10cd3921057bb73eeab11e50c4d21bd94d1",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "5e2f089e65153ff26ae2fe9c0a7bf10cd3921057bb73eeab11e50c4d21bd94d1",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "a6e0be5413b10fc83d243794b26736d6fe7c987ddc16cea21ceb0833742ed951",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "93725eff06e976abab0e41d6df88a03213e52881ec006739ac67fbb8a7c7255e",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "93725eff06e976abab0e41d6df88a03213e52881ec006739ac67fbb8a7c7255e",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "0eb24adf1932969a44533d4e1a783ece30a3f8f99075fd11e972f216deba1c0d",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "f489b48913dfb950b13db0e7f4a20c2804ef8feee8872c8acb8ec900d4ffcbf4",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "6beeb2ae71545f4cf869e70b158a3576e885401334196a1464a197d5c09a27fe",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "13d8b96d0e74d47b2c036046d0ea6e48cb0f81d58ba36b16b40c11300ccd1a57",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "13d8b96d0e74d47b2c036046d0ea6e48cb0f81d58ba36b16b40c11300ccd1a57",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

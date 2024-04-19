// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.1"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "f2e1cf5de6d75a06c1068177b09dc84f3d58dfcd48b4a0a729ce9d62ce8588af",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "f2e1cf5de6d75a06c1068177b09dc84f3d58dfcd48b4a0a729ce9d62ce8588af",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "2d3717377200fb605238625335c133448eaa76d9a9c4ae70308b0cbb8442f18b",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "2d3717377200fb605238625335c133448eaa76d9a9c4ae70308b0cbb8442f18b",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "2d3717377200fb605238625335c133448eaa76d9a9c4ae70308b0cbb8442f18b",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "50574d6a519997a34b54db741c8948e3b72c19fcf73e5fda1e4449e21bbcc434",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "2af64d99df4834cf5a12b8b2e1f5da7bd11d44f2a3a1ae55a1ac9b8243c685ff",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "2af64d99df4834cf5a12b8b2e1f5da7bd11d44f2a3a1ae55a1ac9b8243c685ff",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "db6f60201d5dcc982c69b1a4c7fe0c8300642aebebb503bbe9810e94e1221724",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "f8381060a355dfaac7db9b38a922cde0baf3ef50808b13223914406c9c838cb8",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "ab2101aea771f0b714e167c101f6dfee89304973be9270bacb34b7dfe50c73ce",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "70291d0d5839d5b0019435e2b4dfa41e4b2d4ddf689a620d5ded88f7513f186a",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "70291d0d5839d5b0019435e2b4dfa41e4b2d4ddf689a620d5ded88f7513f186a",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

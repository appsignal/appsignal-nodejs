// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "8dd80e5"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "97421eb7d264f0093bcc68c7bb7282070e4d683124d5eb6c9b4cc649fce885e9",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "97421eb7d264f0093bcc68c7bb7282070e4d683124d5eb6c9b4cc649fce885e9",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "43c95eb9bc349511c0501ba67e5fefb76621ef0c91f3c7f2d7813e5a552fab8c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "43c95eb9bc349511c0501ba67e5fefb76621ef0c91f3c7f2d7813e5a552fab8c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "43c95eb9bc349511c0501ba67e5fefb76621ef0c91f3c7f2d7813e5a552fab8c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "57a667fc7893b0e62bc7938265c8d85a445fc4015451e54d2601de7fca65a89c",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "79adeb2c286d6584dd6c5114e34a8514db37976ecccf83eafdcd2ea9ecea0a15",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "79adeb2c286d6584dd6c5114e34a8514db37976ecccf83eafdcd2ea9ecea0a15",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "40b7f7650a65205c344c524de745fafb2fc798423eb6f508218318313b14f490",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "eea2f571c3a6c786c84ba57995d45f90119b92d20e666249ab964d4ee0d6849f",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "c6070d63a838a08760f9c87dd2e253f7f4bc8e633eb3c4ea21b87a32a44a24f9",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "de9a33514d34e577b4ebad24f17d5eac286fb54c6a65cc9111c9d79588363fb6",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "de9a33514d34e577b4ebad24f17d5eac286fb54c6a65cc9111c9d79588363fb6",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

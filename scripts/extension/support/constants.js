// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "050d7a5"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "ee62934bada7c56fdcd24db84acd42f2cca5d1451f8d0dc7da300c39cc3d6775",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "ee62934bada7c56fdcd24db84acd42f2cca5d1451f8d0dc7da300c39cc3d6775",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "d13c776f6de7a2a727cb6483a30c46e322f8e1190bea403e30b10095633422f8",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "d13c776f6de7a2a727cb6483a30c46e322f8e1190bea403e30b10095633422f8",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "d13c776f6de7a2a727cb6483a30c46e322f8e1190bea403e30b10095633422f8",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "1f605cc4a9d12a4a8a3700354e93b0989e7cfbf643d5233de961d6ac9428479b",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "a2e18e3468b9b10a7f51f292343f00715a1c3bfa8784b5646ef8fbd8939a29a8",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "a2e18e3468b9b10a7f51f292343f00715a1c3bfa8784b5646ef8fbd8939a29a8",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "799666e1f87c9a72f8020ea68db1a59fe97bf0ee8a963a9d2fe2e4b83a6033f2",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "dbcf231cbddf730c80a2e34c0c615df4f36dbd98618eeb51da4d752c757f5a43",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "517a37943737449fea6c9bdc7bda3c4e9ce7f4f934548124228e2d70f3868e38",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "7276a11b75d2e9c00dfe16f5f5e59ee2e39984188104ec8bf6d8ec74290a0847",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "7276a11b75d2e9c00dfe16f5f5e59ee2e39984188104ec8bf6d8ec74290a0847",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.3"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "ba7246847b4e2742a1d2428330a4fa94caa01646151d4d2b4cf53042f64d6d39",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "ba7246847b4e2742a1d2428330a4fa94caa01646151d4d2b4cf53042f64d6d39",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "1fba4f26ff7d2e3a17b8821a06681a3be346b0fac3ed4b5c595089eba1dde8ae",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "1fba4f26ff7d2e3a17b8821a06681a3be346b0fac3ed4b5c595089eba1dde8ae",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "1fba4f26ff7d2e3a17b8821a06681a3be346b0fac3ed4b5c595089eba1dde8ae",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "660894055aa73ffbb639ffb5897250a3bc09be6f9e122c48ec7c174d63c5d8df",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "8b5d47e0257108f1beda38f2e5b67b9c91dc0d70e440385573cc1f43125ef077",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "8b5d47e0257108f1beda38f2e5b67b9c91dc0d70e440385573cc1f43125ef077",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "f37e2c2cca24b8c256e28dbe4105fdfa83fc8f02518eed31e1be0de08589e39e",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "4ba905eee5aba140b67935e63144ae1536e5008f3fa65d31a9d3fd611b196c74",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "5019cdacff24a51611efb5dffbe05f1890b5c2e95051d10597d5c392c5d12b5d",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "32a7ec605e435198e431999745330b49b25355c54f39bd79b9813d9a2616c15c",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "32a7ec605e435198e431999745330b49b25355c54f39bd79b9813d9a2616c15c",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

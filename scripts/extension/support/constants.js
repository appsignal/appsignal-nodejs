// DO NOT EDIT
// This is a generated file by the `rake publish` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.36.10"
const MIRRORS = [
  "https://d135dj0rjqvssy.cloudfront.net",
  "https://appsignal-agent-releases.global.ssl.fastly.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "60a1ad1200143752e3291bb195547c0555c1e45974123de8278baeb0fa05c2a5",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "60a1ad1200143752e3291bb195547c0555c1e45974123de8278baeb0fa05c2a5",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "1bd82f992f9839a48a88fdc54f6a9f904aa376b6abdd204f9234baa6cb84983c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "1bd82f992f9839a48a88fdc54f6a9f904aa376b6abdd204f9234baa6cb84983c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "1bd82f992f9839a48a88fdc54f6a9f904aa376b6abdd204f9234baa6cb84983c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "2ea24ce3779b5dd75d46e7ebb66b60615130926c80fecb61662bc203d37d8ba1",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "70a8fdd25ee783d68f50f48100c84bb777dfe3335106dad91484a7a8e672152f",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "70a8fdd25ee783d68f50f48100c84bb777dfe3335106dad91484a7a8e672152f",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "62e236fcbb45c971a23676614286be396a5f396e8fec35fb7f369e8fba1f2d2a",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "edcee939766ec863eb4ca988553b28a5e506edf7f027cd6d41485b2bbaa94bad",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "286dcc51a1f5174315c8f2f60c8954c81cec9a1a7b90a543021b6b758de0966b",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "ded2bbf9d0636632966b7783a9ae2c59ef55a646828ccb3163c09802a7f94b66",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "ded2bbf9d0636632966b7783a9ae2c59ef55a646828ccb3163c09802a7f94b66",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

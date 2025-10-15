// DO NOT EDIT
// This is a generated file by the `rake publish` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.36.9"
const MIRRORS = [
  "https://d135dj0rjqvssy.cloudfront.net",
  "https://appsignal-agent-releases.global.ssl.fastly.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "a38f2b587d15aba71c7d385ac572e31ca0094cbcd1b72d6c700f51f1d4550038",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "a38f2b587d15aba71c7d385ac572e31ca0094cbcd1b72d6c700f51f1d4550038",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "5426e84708a98776ccc0a3b3f659fdd1e3f5f28a991e15f80505eaa785500073",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "5426e84708a98776ccc0a3b3f659fdd1e3f5f28a991e15f80505eaa785500073",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "5426e84708a98776ccc0a3b3f659fdd1e3f5f28a991e15f80505eaa785500073",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "0baa0c351beaf970116a6f600e1cdf9b2f3a8bc9cff6af7835769b633acca287",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "cba15f6ac8b29aee579a728cb1e71e977ad80ff863b7c57d1f2185cead8ec2b9",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "cba15f6ac8b29aee579a728cb1e71e977ad80ff863b7c57d1f2185cead8ec2b9",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "253fcf6332163591d8c0819da1cd7ff357edf2b645dfe4e081a8ec137e1c257e",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "5acb53b9f1efb6c9a0c572cf0c630454c6f418f9bd484ccbee26fafacda69883",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "a4cac3211dce7b33a7dd55f1b85a98fb60ff419cecb9f18179f5660a2261c057",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "bfa1532cb40bd0d2909d71dc9f8fa6e0ebaf9cf1241bed229d829ea835782b88",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "bfa1532cb40bd0d2909d71dc9f8fa6e0ebaf9cf1241bed229d829ea835782b88",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

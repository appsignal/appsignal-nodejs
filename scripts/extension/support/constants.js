// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "fbdbe33"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "65dac1e560d8f6d4d10275e8fa3d0d0962f68b5c31ce5850f026a1d83f99eb82",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "65dac1e560d8f6d4d10275e8fa3d0d0962f68b5c31ce5850f026a1d83f99eb82",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "c1242036d10ccd6cacd680f3033509312d809fc60655d73747e9b6156ec6580c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "c1242036d10ccd6cacd680f3033509312d809fc60655d73747e9b6156ec6580c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "c1242036d10ccd6cacd680f3033509312d809fc60655d73747e9b6156ec6580c",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "46356d752ba0dbc4d13fc4d44651376e58c4dcbee586e65598917c4d7f919faf",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "074b2a7b70ac32bf2798bd50abd2ecee8fb5214dd3643d3fa83ca8aff2f199a9",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "074b2a7b70ac32bf2798bd50abd2ecee8fb5214dd3643d3fa83ca8aff2f199a9",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "5a0f8d91db4b710a989cc5170be9a0c0223d83631378ea098165710843fcb2a4",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "b0a5b19ed14322d599523fed8a8751d09ddedc99e6127dae0eda405ed5101d9e",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "393bd7020db93e8a59529a5e4cd1c5b3e86d2fe6683785ac3bc052f854b895b9",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "4d84acb6cf5d4311e0da5d177d326666bbbd29ddf01fe6feb705cb8f7ea616cc",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "4d84acb6cf5d4311e0da5d177d326666bbbd29ddf01fe6feb705cb8f7ea616cc",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "734d016"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "9585162408c224437bb497fdb0d8842c50e2ac1561c89f11038403e5101a7129",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "9585162408c224437bb497fdb0d8842c50e2ac1561c89f11038403e5101a7129",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "4f72404254870426a3afbec329f31caedcb70c9963773dec0534383e05a9c243",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "4f72404254870426a3afbec329f31caedcb70c9963773dec0534383e05a9c243",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "4f72404254870426a3afbec329f31caedcb70c9963773dec0534383e05a9c243",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "40a2f772788ab98c8d4bf38f88f10b939a409c65e52983c9c936aa35e76530f7",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "c2de02cdc9cbe5353dcda1e3a5e510d503325e492cd929555f7e2dbf6853b947",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "c2de02cdc9cbe5353dcda1e3a5e510d503325e492cd929555f7e2dbf6853b947",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "6f8a92b2a796135359166f7fc9ed64af0f58231d4099b3408e6c8ee04b931eb1",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "852087d0e2540cd6c50a8270a6691e919626a5e675212c2365df8523401f6b41",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "560b44592f44508ddaef0cde9ce84348828f640056be4f1f2f56863d8de79e7c",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "a290d5a01d5fc17c0876eea4121ac8cc80afc97c4d32aa97c25988a3c039fff7",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "a290d5a01d5fc17c0876eea4121ac8cc80afc97c4d32aa97c25988a3c039fff7",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

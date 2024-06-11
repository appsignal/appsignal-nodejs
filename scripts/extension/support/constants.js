// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.12"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "61210c40be70e0616a356d06040961b096e2d47332021a52f3779912a9fe0e4c",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "61210c40be70e0616a356d06040961b096e2d47332021a52f3779912a9fe0e4c",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "9b97c42561450f9af9ae63816d32b8db69be6f2745226f63d6eada4369c68a20",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "9b97c42561450f9af9ae63816d32b8db69be6f2745226f63d6eada4369c68a20",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "9b97c42561450f9af9ae63816d32b8db69be6f2745226f63d6eada4369c68a20",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "358db07cfa85d6bd048bd2bb05fc9607d4fe0d4396fd023d658e945e4a675fba",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "315bf1fc5d9c97b6f26e61f5e39919e0ba425b1d96ea6243cdb2f650487c407e",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "315bf1fc5d9c97b6f26e61f5e39919e0ba425b1d96ea6243cdb2f650487c407e",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "3fe42df2a52706c23f967b8421ac816fa37a38998bd24b1d6aafd59a324b23ff",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "1fe0ed0c0ca51eccd4c2ec3bb94bb1834bae19bc2c185b67c3f940f704abe9fc",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "5027782008872f8091608cc5531a6dd90f0652e9ebb0404f7e86eb73f0807ba0",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "1337268caaddd66bb170298968d50d76cc66f17e808c46a677ba00d1b78eb317",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "1337268caaddd66bb170298968d50d76cc66f17e808c46a677ba00d1b78eb317",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

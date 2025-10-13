// DO NOT EDIT
// This is a generated file by the `rake publish` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.36.8"
const MIRRORS = [
  "https://d135dj0rjqvssy.cloudfront.net",
  "https://appsignal-agent-releases.global.ssl.fastly.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "e8fb6caaefc30fd6abef2ed199e8bbddb9ebb43b8e092979ccfca463f2d23d43",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "e8fb6caaefc30fd6abef2ed199e8bbddb9ebb43b8e092979ccfca463f2d23d43",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "d535bf95425595b7227cb51b7e7bf082e7fdaf04a85621f475e6ebb0911c2ac5",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "d535bf95425595b7227cb51b7e7bf082e7fdaf04a85621f475e6ebb0911c2ac5",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "d535bf95425595b7227cb51b7e7bf082e7fdaf04a85621f475e6ebb0911c2ac5",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "2ba267cf20dcfe741aa1f404d8917a073cda00b4e2a995ac87fd379a1dcc5c06",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "a1693984e34358be4ca96cee7449895f02599a4047db9c86c22cc493c3420494",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "a1693984e34358be4ca96cee7449895f02599a4047db9c86c22cc493c3420494",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "ec36be63f3cf259179e593ec1edae5a0caf0e24596751fba3b6daca9ac83bae6",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "7886d80fdbb3009cea9beb383c9c76e278c1672b80f84098fd0233d3d7a8d807",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "5c1fcde057dceb7bb6542205be1372a592cba26bd543b125a930369d923b8aca",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "dc960a662bb9b1efef770b86e702c603cdddc2dfc7a5391cf9cb03ec67445e7b",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "dc960a662bb9b1efef770b86e702c603cdddc2dfc7a5391cf9cb03ec67445e7b",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

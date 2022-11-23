// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0c870c0"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "13d2676d2c2b0d4feff4af8eeafd0f1259bffa7e2bca6843301c6b177fec89de",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "13d2676d2c2b0d4feff4af8eeafd0f1259bffa7e2bca6843301c6b177fec89de",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "1fe7db059d84a2aac2f7fd939b055b125355f39c10eeb975cb8725d3ece12039",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "1fe7db059d84a2aac2f7fd939b055b125355f39c10eeb975cb8725d3ece12039",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "1fe7db059d84a2aac2f7fd939b055b125355f39c10eeb975cb8725d3ece12039",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "61bb2c0a2314b174b85785f37aa0dcc2587bba62d9156118cd222bf3e90b12cf",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "547912aacbecb396af356564971b6d2d2494320c7533362edc3818f44080feac",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "547912aacbecb396af356564971b6d2d2494320c7533362edc3818f44080feac",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "39b4cd3d3e648c8d8de52720bf4794328f454ae43f130cd67dafbf88c9070b90",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "ca14cf60bab664600d90cc9b13239e60dd68e4005f78d401e3d41442dcbc0471",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "016b90274bcedf02253244b44cd93b85b1baf4d5a6b2f9761f9ab15b8c895198",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "0dc94715af8cc8dbbc21237e4675c4bbaf5f418c0ec10e1fb1f89cf1786602fc",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "0dc94715af8cc8dbbc21237e4675c4bbaf5f418c0ec10e1fb1f89cf1786602fc",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.16"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "730635d12cd05bfb06f94de576f56544446d12adbe1966779c2fe6c7ea3ed3e8",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "730635d12cd05bfb06f94de576f56544446d12adbe1966779c2fe6c7ea3ed3e8",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "172ad3396a9857fff0984b9ddb082e582a6af5bcdfa2c1a59784c9de0ed78da6",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "172ad3396a9857fff0984b9ddb082e582a6af5bcdfa2c1a59784c9de0ed78da6",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "172ad3396a9857fff0984b9ddb082e582a6af5bcdfa2c1a59784c9de0ed78da6",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "8961bbf100d1e4c81bec1776552d7bb86740eaa48d59c3c8ad0c529a73c0d67a",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "12be94f908a3f3156c729cf5bd15947116c957826c21fcd811643c1e5bb0e869",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "12be94f908a3f3156c729cf5bd15947116c957826c21fcd811643c1e5bb0e869",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "4b2324dff70ab29b76311511a7b4c763f002e359bd306fd528ade347cded922f",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "a285df98244e4c478b68c478f211ea8f886653bd84f65cef1c67af0887e60747",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "c171f6c45860b7ccc7db9d2a620787d3cf904be42a35b158dc527b4d0087473c",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "7045790a8554491c85c42d3f29ab6b2276028883f9b95688c3c9d5f0cfb597d3",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "7045790a8554491c85c42d3f29ab6b2276028883f9b95688c3c9d5f0cfb597d3",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

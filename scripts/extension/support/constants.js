// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "041b9c4"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "1516895bcf7295b182ae816535ae21992cf7ab56686b3084787bed1d72007c52",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "1516895bcf7295b182ae816535ae21992cf7ab56686b3084787bed1d72007c52",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "1131e69c561a8b8df162f6d7d18b8e7a13a6ae3df095eccad5fe47ad3ebdf4db",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "1131e69c561a8b8df162f6d7d18b8e7a13a6ae3df095eccad5fe47ad3ebdf4db",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "1131e69c561a8b8df162f6d7d18b8e7a13a6ae3df095eccad5fe47ad3ebdf4db",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "bb7d6cdf86882e144840f8c15d832beaf2eca0696aad9c99ad14883738c6f358",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "68eed9076c4a859d3415127fc0b0ad9d6a059df936af3fe619df5efca5162915",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "68eed9076c4a859d3415127fc0b0ad9d6a059df936af3fe619df5efca5162915",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "13e9bd42518adac8838b938d197e1c211ed41611906f6b4b19962c95ba2ec352",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "89b517bf79514e534d2e9df39c2b5e7aa857e831c961034586334f1d622ca633",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "64034582e6caed028c102a7f24c0a0dec0f8447eeadaf86a156db8527f936815",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "c37a5e48eebc91ed750c1e51b8a0d569b5913f183405f62b4c3c15f9a17f1980",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "c37a5e48eebc91ed750c1e51b8a0d569b5913f183405f62b4c3c15f9a17f1980",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

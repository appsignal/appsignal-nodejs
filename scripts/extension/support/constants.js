// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "de2dd6e"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "95dcfb45b90551ffe2d2297ada64598fb117e1d76a75417940d525c853f91592",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "95dcfb45b90551ffe2d2297ada64598fb117e1d76a75417940d525c853f91592",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "16e604e0835f90a23de20497bba58e29e633cce5cff9b994b9cca219f35abd83",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "16e604e0835f90a23de20497bba58e29e633cce5cff9b994b9cca219f35abd83",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "16e604e0835f90a23de20497bba58e29e633cce5cff9b994b9cca219f35abd83",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "51270f21e843b53824854c184ea52bc95be2a25c761ef2e930b0b0d02d8e07da",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "8efe967ded49ba2cef2cabf67f97e4dfe242fb9fba4fd02f848a22d6e5ae7165",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "8efe967ded49ba2cef2cabf67f97e4dfe242fb9fba4fd02f848a22d6e5ae7165",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "7d27b3a7f59d9a3515cd7d0403e19dd618452b15444d87d42197d43227e4a539",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "4ee8fb0e743634a4365113114d4a077779b2773f521e5a71e917d210d9ffe07b",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "d1a19f4ba04849ceb3ad44ff254fd15a7c12dacffc1c3d58be6705a59395cbe2",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "93a7b1235a230d09f9416b01ed04f902b775b069a292d79c659f0aefa02afe05",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "93a7b1235a230d09f9416b01ed04f902b775b069a292d79c659f0aefa02afe05",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

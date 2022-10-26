// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "09f0471"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "9dcd0d925b656241c407e5e7a4dbd9fb1453dc5ac95d831eceaed473caff4959",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "9dcd0d925b656241c407e5e7a4dbd9fb1453dc5ac95d831eceaed473caff4959",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "21525bbc21e1db456edec41fd8dcde259374698ce7cd7f07608ff65efbc71a7a",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "21525bbc21e1db456edec41fd8dcde259374698ce7cd7f07608ff65efbc71a7a",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "21525bbc21e1db456edec41fd8dcde259374698ce7cd7f07608ff65efbc71a7a",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "9b0cb608f9ee2dab8a4348a566228fa4f1c6f0da3c1f5551f44779ce8588e0ab",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "2f1ab4390a55a2826c3ea87f1d0fd84a5abb0bc8d23873b9545ae10c072fb163",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "2f1ab4390a55a2826c3ea87f1d0fd84a5abb0bc8d23873b9545ae10c072fb163",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "0310a26edd5c44bc1080ee251ad1572adf088610946b8e839e656c4d7e3ba7a6",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "4749371d7f1f48ca7dc3bc0dd31254a42f1c1acec8fffdd9584b76cdf02b1866",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "e2c7e5e70b5ce575df28a27b9ed61007629ad96905ef8a362890399427afe339",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "0dbc4daab7b1c8ffb47c838f907a4bab61608ebf406446f5724adc4fb1678dca",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "0dbc4daab7b1c8ffb47c838f907a4bab61608ebf406446f5724adc4fb1678dca",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

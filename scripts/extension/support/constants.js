// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "0.35.4"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "47331b7d5e44e1f93f552e61b56a09a27428ff07fb90c499e96561bff35694d8",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "47331b7d5e44e1f93f552e61b56a09a27428ff07fb90c499e96561bff35694d8",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "b51beed1aafb79a9ebda48fc3b9201a67a068a02da651c56a8fd1ae747ce8a71",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "b51beed1aafb79a9ebda48fc3b9201a67a068a02da651c56a8fd1ae747ce8a71",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "b51beed1aafb79a9ebda48fc3b9201a67a068a02da651c56a8fd1ae747ce8a71",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "99653265d35232d9ec65a01dc6b1c41b1512206eeb9166aa7529a664a43949e4",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "29b8f906551f2c85d8f644e3b2107a7b0705fb5a804da2ead2a039a8492a21d4",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "29b8f906551f2c85d8f644e3b2107a7b0705fb5a804da2ead2a039a8492a21d4",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "78202e119728d849d75a5c6683a68f85f49f0643d25899b82fcf1e74ac28ace3",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "ffeea88d9af7cf61ca173b45ef26ec0e9fde737095f838c5ec6820319ae5a1b8",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "aarch64-linux-musl": {
    checksum:
      "dcf0ba934c93bdce3f6e91eb7c5d43f44596d6a85c7f97903e38284597192d16",
    filename: "appsignal-aarch64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "7de9ba048c6c3e9ec87dc3b014a47456bf6ee74b6c3639257abf413bf591d890",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "7de9ba048c6c3e9ec87dc3b014a47456bf6ee74b6c3639257abf413bf591d890",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

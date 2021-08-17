const AGENT_VERSION = "47ac554"

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "52cdfe983b2ca185fa77040f895a4deeb5b3762a1ae8a74a1898112347005459",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "52cdfe983b2ca185fa77040f895a4deeb5b3762a1ae8a74a1898112347005459",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "cece9b717ef39bd61326b083c79539b813f8967da327fa9f9398e58e6b27ee62",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "cece9b717ef39bd61326b083c79539b813f8967da327fa9f9398e58e6b27ee62",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "cece9b717ef39bd61326b083c79539b813f8967da327fa9f9398e58e6b27ee62",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "a3d2029f8cfa1942c3bfa8e9fcda60545f44cef73bc7212f17e3b76b521b1a5f",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "1c8e9ce9a64f4a569e542252f61497b4c4f2887d410cd118569a56f34363bde4",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "1c8e9ce9a64f4a569e542252f61497b4c4f2887d410cd118569a56f34363bde4",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "4f2ff323ea9bc923bfcae9c01e06c895bae26f5a40b2279036360d01e0c78b62",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "2a3014f548890e23b80e363f9243fb633230c7f695df0d81f2dd5e88ab79261a",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "e27a927ee86b64fba487a85ee72d30a3d80f6c48ffb9d3e70bb36a78f63b555e",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "e27a927ee86b64fba487a85ee72d30a3d80f6c48ffb9d3e70bb36a78f63b555e",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/47ac554/appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, TRIPLES }

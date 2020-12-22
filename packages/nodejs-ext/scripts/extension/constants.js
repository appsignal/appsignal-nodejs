const AGENT_VERSION = "1332013"

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "6ab6f3be3857058f962999ec743524627599b892828daf6524fefc260187e917",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "6ab6f3be3857058f962999ec743524627599b892828daf6524fefc260187e917",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "9602cb9e133937d5087e24b494e56e83b01e599861eaf6c09c144549b7ea23a5",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "9602cb9e133937d5087e24b494e56e83b01e599861eaf6c09c144549b7ea23a5",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "6079a08029926f5379b7218473d1dc3ba63aeca5ba25dfc7b2143c999cdb691b",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "c246637db27fc1b87ad79bbefe5e5df636f81a0eab792543d3b206c8fbf44d48",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "6a6914943520861a45a7f87c0e6fb2940ee5a5cbfe0693377ec0a38ebe31f470",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "6a6914943520861a45a7f87c0e6fb2940ee5a5cbfe0693377ec0a38ebe31f470",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/1332013/appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, TRIPLES }

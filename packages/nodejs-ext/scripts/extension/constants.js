const AGENT_VERSION = "2f2cb43"

const TRIPLES = {
  "x86_64-darwin": {
    checksum: "e8267dd5d565588ab43965b5c20c7ef97bb3611235244f05af0863f3c52559df",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum: "e8267dd5d565588ab43965b5c20c7ef97bb3611235244f05af0863f3c52559df",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "i686-linux": {
    checksum: "2af725a6d654277a4f6335658942e8b17099038fb27062d8b79d38a134b2dbba",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum: "2af725a6d654277a4f6335658942e8b17099038fb27062d8b79d38a134b2dbba",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum: "acab21121ea1c794f7077af386469e1c83f43b1287f943fed86ac5e441087c78",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum: "b8ba1be3a454e4cbf6c995319637e6336015e73122b3c6e73c4daf20771eb16a",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum: "4326b06c52fe24258d0a57d1ebf42c9d711a9167df30273cd9067339d540f2f4",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum: "4326b06c52fe24258d0a57d1ebf42c9d711a9167df30273cd9067339d540f2f4",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/2f2cb43/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
}

module.exports = { AGENT_VERSION, TRIPLES }

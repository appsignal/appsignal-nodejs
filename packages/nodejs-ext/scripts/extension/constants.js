const AGENT_VERSION = "dc62118"

const TRIPLES = {
  "x86_64-darwin": {
    checksum: "910415a6abd661a169e12c56ff89734d83449f78348641aba2b679f22d479be5",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum: "910415a6abd661a169e12c56ff89734d83449f78348641aba2b679f22d479be5",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "i686-linux": {
    checksum: "4fac11904f69bcda3ac1b8f6f5faedafc874ad8b35a73b8c5cda345a4b0a2093",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum: "4fac11904f69bcda3ac1b8f6f5faedafc874ad8b35a73b8c5cda345a4b0a2093",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum: "b97940797ab9a703eb015e491118e775539cad0870d56d4ee58e0d6fba620bde",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum: "1ab54f5911bd820b546f30b8d626f1b0c53a4062e58f0468eaed8975ec84eeb4",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum: "7aa6232b0520dec1ab56adc51d4849907e0f9344554b591dc374b2a154f6be80",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum: "7aa6232b0520dec1ab56adc51d4849907e0f9344554b591dc374b2a154f6be80",
    downloadUrl: "https://appsignal-agent-releases.global.ssl.fastly.net/dc62118/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
}

module.exports = { AGENT_VERSION, TRIPLES }

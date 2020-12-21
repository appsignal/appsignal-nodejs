const AGENT_VERSION = "947b6b4"

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "8c7f9d96d6f08f71bbb027c564d529378c29e1a0396a94d79b7f1539071fbf22",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "8c7f9d96d6f08f71bbb027c564d529378c29e1a0396a94d79b7f1539071fbf22",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "3e77977f1c05ab3b460cd78d8efbb988f7abf1b9e749034d43b984636fb3c5b9",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "3e77977f1c05ab3b460cd78d8efbb988f7abf1b9e749034d43b984636fb3c5b9",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "c3baec4e9179a5cc9f90699b19b5e4d15bee00c5236a30f67a20b3f18d559a11",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "8b2aa9831f50920c7fcc26dbb0d1a0ff6d137389eb80e7dfdf50982d6d789678",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "cdfdf17f1e67b925b680da0bfda1dc9bcab191e574f7757963c1533a09c0d292",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "cdfdf17f1e67b925b680da0bfda1dc9bcab191e574f7757963c1533a09c0d292",
    downloadUrl:
      "https://appsignal-agent-releases.global.ssl.fastly.net/947b6b4/appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, TRIPLES }

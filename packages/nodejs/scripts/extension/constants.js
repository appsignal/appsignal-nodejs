const AGENT_VERSION = "b371394"

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "75681dba99b3d0a6423d85276b942613e24fa45918c0fb50ce833be216648ccf",
    downloadUrl: `https://appsignal-agent-releases.global.ssl.fastly.net/${AGENT_VERSION}/appsignal-x86_64-darwin-all-static.tar.gz`
  },
  "x86_64-linux": {
    checksum:
      "2ececc7e0bfb114f4953dabf07d88b669db4afabd87ec5120ad79cc6700aa739",
    downloadUrl: `https://appsignal-agent-releases.global.ssl.fastly.net/${AGENT_VERSION}/appsignal-x86_64-linux-all-static.tar.gz`
  },
  "x86_64-linux-musl": {
    checksum:
      "4a8f690d518a981d94030442b995091781669577ce769e102283d0d383129449",
    downloadUrl: `https://appsignal-agent-releases.global.ssl.fastly.net/${AGENT_VERSION}/appsignal-x86_64-linux-musl-all-static.tar.gz`
  },
  "x86_64-freebsd": {
    checksum:
      "2405e8eb9d5cd1b832de9e5ddde2cb4ef5bfe5c015bd7a511721333b921bedab",
    downloadUrl: `https://appsignal-agent-releases.global.ssl.fastly.net/${AGENT_VERSION}/appsignal-x86_64-freebsd-all-static.tar.gz`
  },
  "i686-linux": {
    checksum:
      "55d9f552354fa4740e7275c5cff7bd97dfcaf549ac639ad17473d8a3d3d641aa",
    downloadUrl: `https://appsignal-agent-releases.global.ssl.fastly.net/${AGENT_VERSION}/appsignal-i686-linux-all-static.tar.gz`
  },
  "i686-linux-musl": {
    checksum:
      "07f633ab0cdcf278d6589745be732e8dda66c177fe6ebd3505563c89aa6ee83d",
    downloadUrl: `https://appsignal-agent-releases.global.ssl.fastly.net/${AGENT_VERSION}/appsignal-i686-linux-musl-all-static.tar.gz`
  }
}

module.exports = { AGENT_VERSION, TRIPLES }

// DO NOT EDIT
// This is a generated file by the `rake ship` family of tasks in the
// appsignal-agent repository.
// Modifications to this file will be overwritten with the next agent release.

const AGENT_VERSION = "1a8ac46"
const MIRRORS = [
  "https://appsignal-agent-releases.global.ssl.fastly.net",
  "https://d135dj0rjqvssy.cloudfront.net"
]

const TRIPLES = {
  "x86_64-darwin": {
    checksum:
      "cdff0e54071563a17603e85d7ae19864a8181761824b112fde9e4165cbd2d6a6",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "universal-darwin": {
    checksum:
      "cdff0e54071563a17603e85d7ae19864a8181761824b112fde9e4165cbd2d6a6",
    filename: "appsignal-x86_64-darwin-all-static.tar.gz"
  },
  "aarch64-darwin": {
    checksum:
      "4df965a2f9b28216566a3d176b1a91bd093e625de72820e43b0f140d9ae061ad",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm64-darwin": {
    checksum:
      "4df965a2f9b28216566a3d176b1a91bd093e625de72820e43b0f140d9ae061ad",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "arm-darwin": {
    checksum:
      "4df965a2f9b28216566a3d176b1a91bd093e625de72820e43b0f140d9ae061ad",
    filename: "appsignal-aarch64-darwin-all-static.tar.gz"
  },
  "aarch64-linux": {
    checksum:
      "631d3b46e58b80a69e8159c791dd44a078ecd80e0e18573512e8f59fdb1a2ab0",
    filename: "appsignal-aarch64-linux-all-static.tar.gz"
  },
  "i686-linux": {
    checksum:
      "fb6e5d54cbba4c40d17a8b8e2e28122a65115c494e89034b80eb86cf27331b08",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86-linux": {
    checksum:
      "fb6e5d54cbba4c40d17a8b8e2e28122a65115c494e89034b80eb86cf27331b08",
    filename: "appsignal-i686-linux-all-static.tar.gz"
  },
  "x86_64-linux": {
    checksum:
      "f1d807e9d0992a1b46ef076c4dd5c52316078564f6671b278e686f77cd9dde1a",
    filename: "appsignal-x86_64-linux-all-static.tar.gz"
  },
  "x86_64-linux-musl": {
    checksum:
      "dd4f0e4d7cee25cf4680216a8484bec4d903f1ddf5840b237b7d24632fce994b",
    filename: "appsignal-x86_64-linux-musl-all-static.tar.gz"
  },
  "x86_64-freebsd": {
    checksum:
      "b450fd48fd3123ba7044a52d7afccabcc9ea10452a10362307e9d3df11cda690",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  },
  "amd64-freebsd": {
    checksum:
      "b450fd48fd3123ba7044a52d7afccabcc9ea10452a10362307e9d3df11cda690",
    filename: "appsignal-x86_64-freebsd-all-static.tar.gz"
  }
}

module.exports = { AGENT_VERSION, MIRRORS, TRIPLES }

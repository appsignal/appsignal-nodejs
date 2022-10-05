#!/bin/bash
/usr/bin/mongod --bind_ip_all --replSet mongo-replica-set 2>&1 &

sleep 5

mongosh <<EOF
const config = {
  _id: "mongo-replica-set",
  version: 1,
  members: [
    {
      _id: 1,
      host: "mongo:27017",
      priority: 3
    },
    {
      _id: 2,
      host: "mongo-2:27017",
      priority: 2
    },
    {
      _id: 3,
      host: "mongo-3:27017",
      priority: 1
    }
  ]
}

rs.initiate(config)
rs.status()
EOF

tail -f /dev/null

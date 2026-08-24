#!/bin/bash

set -eu

echo "Checking MongoDB availability"
until nc -z $DATABASE_HOST 27017; do
  >&2 echo "Mongo is unavailable - sleeping"
  sleep 1
done

export DATABASE_URL="mongodb://$DATABASE_HOST:27017/mongoose"

echo "Giving permission to all users on span directory"
chmod -R 777 /spans

echo "Install, link and build integration"
(
cd /integration
npm install
npm run build
npm link
)

cd /app

echo "Installing app dependencies"
npm install

echo "Linking integration"
npm link @appsignal/nodejs

echo "Building the app"
npm run build

echo "Running seed"
npm run seed

echo "Checking that one version of @opentelemetry/api is resolved"
# Two copies means the app reports nothing and the suite fails with an empty
# spans file, which says nothing about why.
node /integration/scripts/check_otel_duplicates.js /app --api-only || exit 1

echo "Starting test app server"
npm run server

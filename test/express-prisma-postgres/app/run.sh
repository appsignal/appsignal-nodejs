#!/bin/bash

set -eu

echo "Checking PostgreSQL availability"
until psql $DATABASE_URL --command='\l'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

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

echo "Running Prisma migrations"
npx prisma migrate dev

echo "Building the app"
npm run build

echo "Running prisma seeds"
npx prisma db seed

echo "Checking that one version of @opentelemetry/api is resolved"
# Two copies means the app reports nothing and the suite fails with an empty
# spans file, which says nothing about why.
node /integration/scripts/check_otel_duplicates.js /app --api-only || exit 1

echo "Starting test app server"
npm run server

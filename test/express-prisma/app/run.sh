#!/bin/bash

set -eu

echo "Checking PostgreSQL availability"
until psql $DATABASE_URL --command='\l'; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

echo "Giving permission to all users on span directory"
chmod -R 777 /spans

echo "Installing compatible NPM version"
npm install -g npm@7.18.1

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

echo "Running prisma seeds"
npx prisma db seed

echo "Starting test app server"
npm run server

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

echo "Starting test app server"
npm run server

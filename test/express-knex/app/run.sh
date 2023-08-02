#!/bin/bash

set -eu

echo "Giving permission to all users on span directory"
chmod -R 777 /spans

echo "Install a compatible NPM version"
npm install -g npm@9.7.1

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

echo "Installing knex globally"
npm install knex -g

echo "Running migrations"
knex migrate:latest --knexfile ./knexfile.js

echo "Starting test app server"
npm run server
